<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\Page;
use App\Models\Revision;
use App\Models\User;
use App\Notifications\EnquiryReceived;
use App\Notifications\StaffInvitation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class WorkspaceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.key' => 'base64:'.base64_encode(str_repeat('k', 32))]);
        $this->withoutVite();
        Notification::fake();
    }

    private function user($role = 'admin'): User
    {
        $u = User::factory()->create();
        $u->role = $role;
        $u->save();

        return $u;
    }

    private function content($slug = 'speech', array $extra = []): Content
    {
        return Content::create(array_replace_recursive(['slug' => $slug, 'type' => 'parliament', 'featured' => false, 'published_at' => now()->subMinute(), 'parliament_kind' => 'speech', 'session_year' => 2026, 'event_date' => '2026-05-20', 'topics' => ['Governance'], 'ministry' => 'Justice', 'translations' => ['en' => ['title' => 'A speech', 'status' => 'published', 'body' => 'Original text']]], $extra));
    }

    private function payload(Content $c): array
    {
        return collect($c->toArray())->except(['id', 'created_at', 'updated_at', 'deleted_at'])->all();
    }

    public function test_page_seed_is_idempotent_and_review_gates_hide_kreol_and_legal(): void
    {
        $this->seed();
        $this->seed();
        $this->assertDatabaseCount('pages', 9);
        $this->getJson('/api/pages/en')->assertJsonPath('data.home.hero_title', 'Khushal')->assertJsonMissingPath('data.privacy');
        $this->getJson('/api/pages/km')->assertJsonMissingPath('data.home');
    }

    public function test_page_edit_revisions_and_stale_writes(): void
    {
        $this->seed();
        $this->actingAs($this->user());
        $p = Page::where('slug', 'home')->first();
        $tr = $p->translations;
        $tr['en']['hero_title'] = 'New heading';
        $this->putJson('/api/admin/pages/'.$p->id, ['version' => 0, 'translations' => $tr])->assertOk()->assertJsonPath('version', 1);
        $this->assertSame('New heading', $p->fresh()->translations['en']['hero_title']);
        $this->getJson('/api/pages/en')->assertJsonMissingPath('data.home');
        $this->assertDatabaseCount('revisions', 2);
        $this->putJson('/api/admin/pages/'.$p->id, ['version' => 0, 'translations' => $tr])->assertStatus(409);
    }

    public function test_legal_requires_owner_approval_and_editor_is_forbidden(): void
    {
        $this->seed();
        $p = Page::where('slug', 'privacy')->first();
        $tr = $p->translations;
        $tr['en']['status'] = 'published';
        $this->actingAs($this->user('editor'))->putJson('/api/admin/pages/'.$p->id, ['version' => 0, 'translations' => $tr])->assertForbidden();
        $this->actingAs($this->user())->putJson('/api/admin/pages/'.$p->id, ['version' => 0, 'translations' => $tr])->assertUnprocessable();
        $tr['en']['legal_approved'] = true;
        $this->putJson('/api/admin/pages/'.$p->id, ['version' => 0, 'translations' => $tr])->assertOk();
        $this->getJson('/api/pages/en')->assertJsonPath('data.privacy.hero_title', 'Privacy notice');
    }

    public function test_restore_creates_draft_and_retains_history(): void
    {
        $this->actingAs($this->user());
        $c = $this->content();
        $this->putJson('/api/admin/contents/'.$c->id, $this->payload($c))->assertOk();
        $first = Revision::first();
        $this->deleteJson('/api/admin/contents/'.$c->id)->assertOk();
        $this->getJson('/api/content/en')->assertJsonCount(0, 'data');
        $this->postJson('/api/admin/revisions/'.$first->id.'/restore', ['version' => 1])->assertOk()->assertJsonPath('translations.en.status', 'draft')->assertJsonPath('published_at', null);
        $this->assertNotSoftDeleted('contents', ['id' => $c->id]);
        $this->assertDatabaseCount('revisions', 4);
    }

    public function test_parliament_filters_and_pagination_do_not_leak_drafts(): void
    {
        $this->content();
        $this->content('bill', ['parliament_kind' => 'bill', 'session_year' => 2025]);
        $this->content('draft', ['translations' => ['en' => ['status' => 'draft']]]);
        $this->getJson('/api/content/en?type=parliament&kind=speech&year=2026&topic=Governance&from=2026-01-01&to=2026-12-31&ministry=Justice')->assertJsonCount(1, 'data')->assertJsonPath('data.0.slug', 'speech');
        $this->getJson('/api/content/en?type=parliament&per_page=1')->assertJsonPath('meta.total', 2)->assertJsonPath('meta.last_page', 2);
        $this->getJson('/api/content/en/speech')->assertJsonPath('parliament_kind', 'speech');
    }

    public function test_pdf_is_private_until_attached_to_published_content(): void
    {
        Storage::fake('local');
        $this->actingAs($this->user());
        $pdf = UploadedFile::fake()->createWithContent('record.pdf', "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF");
        $result = $this->postJson('/api/admin/media', ['file' => $pdf])->assertCreated();
        $id = $result->json('id');
        $this->get('/documents/'.$id)->assertNotFound();
        $this->content('pdf-record', ['attachments' => [$id]]);
        $this->get('/documents/'.$id)->assertOk()->assertHeader('Content-Disposition');
        $this->get('/documents/'.$id.'?locale=fr')->assertNotFound();
    }

    public function test_images_are_reencoded_and_gallery_captions_are_localized(): void
    {
        Storage::fake('public');
        $this->actingAs($this->user());
        $image = $this->postJson('/api/admin/media', ['file' => UploadedFile::fake()->image('original.jpg', 100, 100)])->assertCreated();
        $url = $image->json('url');
        $this->assertStringEndsWith('.webp', $url);
        $this->content('gallery', ['type' => 'gallery', 'gallery' => [['image' => $url, 'translations' => ['en' => ['caption' => 'Portrait', 'alt' => 'Khushal portrait'], 'fr' => ['caption' => 'Portrait français']]]]]);
        $this->getJson('/api/content/en/gallery')->assertJsonPath('gallery.0.caption', 'Portrait')->assertJsonMissingPath('gallery.0.translations');
    }

    public function test_unsupported_video_hosts_are_rejected(): void
    {
        $this->actingAs($this->user());
        $c = $this->content();
        $p = $this->payload($c);
        $p['video_url'] = 'https://evil.example/embed';
        $this->putJson('/api/admin/contents/'.$c->id, $p)->assertUnprocessable();
        $p['video_url'] = 'https://youtu.be/dQw4w9WgXcQ';
        $this->putJson('/api/admin/contents/'.$c->id, $p)->assertOk();
        $this->getJson('/api/content/en/speech')->assertJsonPath('embed_url', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    }

    public function test_enquiry_alerts_go_only_to_opted_in_active_staff(): void
    {
        $a = $this->user();
        $b = $this->user();
        $b->notify_enquiries = false;
        $b->save();
        $c = $this->user();
        $c->is_active = false;
        $c->save();
        $this->postJson('/api/enquiries', ['name' => 'Resident', 'email' => 'resident@example.com', 'subject' => 'Local issue', 'kind' => 'concern', 'message' => 'Please discuss a local issue.', 'locale' => 'en', 'consent' => true])->assertCreated();
        Notification::assertSentTo($a, EnquiryReceived::class);
        Notification::assertNotSentTo($b, EnquiryReceived::class);
        Notification::assertNotSentTo($c, EnquiryReceived::class);
    }

    public function test_staff_invite_permissions_and_suspension(): void
    {
        $editor = $this->user('editor');
        $this->actingAs($editor)->getJson('/api/admin/staff')->assertForbidden();
        $admin = $this->user();
        $this->actingAs($admin)->postJson('/api/admin/staff', ['name' => 'New Editor', 'email' => 'new@example.com', 'role' => 'editor'])->assertCreated();
        $u = User::where('email', 'new@example.com')->first();
        Notification::assertSentTo($u, StaffInvitation::class);
        $this->putJson('/api/admin/staff/'.$admin->id, ['name' => $admin->name, 'role' => 'editor', 'is_active' => true, 'notify_enquiries' => true])->assertUnprocessable();
        $this->putJson('/api/admin/staff/'.$editor->id, ['name' => $editor->name, 'role' => 'editor', 'is_active' => false, 'notify_enquiries' => false])->assertOk();
        $this->actingAs($editor->fresh())->getJson('/api/admin/contents')->assertForbidden();
    }

    public function test_one_time_staff_activation_enrols_totp_and_invalidates_token(): void
    {
        $u = $this->user('editor');
        $u->two_factor_secret = null;
        $u->save();
        $token = Password::createToken($u);
        $identity = ['email' => $u->email, 'token' => $token];
        $prep = $this->postJson('/api/staff/prepare', $identity)->assertOk()->assertHeader('Cache-Control', 'no-store, private');
        $secret = $prep->json('secret');
        $code = (new Google2FA)->getCurrentOtp($secret);
        $this->postJson('/api/staff/activate', [...$identity, 'password' => 'new-secure-password', 'password_confirmation' => 'new-secure-password', 'code' => $code])->assertOk();
        $u->refresh();
        $this->assertTrue(Hash::check('new-secure-password', $u->password));
        $this->assertSame($secret, $u->two_factor_secret);
        $this->assertFalse(Password::tokenExists($u, $token));
    }

    public function test_existing_authenticator_is_required_for_password_reset(): void
    {
        $u = $this->user();
        $u->two_factor_secret = (new Google2FA)->generateSecretKey();
        $u->save();
        $identity = ['email' => $u->email, 'token' => Password::createToken($u)];
        $this->postJson('/api/staff/prepare', $identity)->assertJsonPath('enrolled', true)->assertJsonMissingPath('secret');
        $this->postJson('/api/staff/activate', [...$identity, 'password' => 'another-secure-password', 'password_confirmation' => 'another-secure-password', 'code' => '000000'])->assertUnprocessable();
    }

    public function test_kreol_indexing_requires_both_page_and_interface_review(): void
    {
        $this->seed();
        $this->actingAs($this->user());
        $p = Page::where('slug', 'home')->first();
        $tr = $p->translations;
        $tr['km']['status'] = 'published';
        $tr['km']['reviewed'] = true;
        $this->putJson('/api/admin/pages/'.$p->id, ['version' => 0, 'translations' => $tr])->assertOk();
        $this->get('/km')->assertOk()->assertHeader('X-Robots-Tag', 'noindex, nofollow');
        $this->getJson('/api/pages/en')->assertJsonMissingPath('data.home.review_notes');
        $this->putJson('/api/admin/settings', ['kreol_interface_approved' => true])->assertOk();
        $this->get('/km')->assertOk()->assertHeaderMissing('X-Robots-Tag');
        $this->get('/sitemap.xml')->assertSee('/km');
    }
}
