<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\Enquiry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class EditorialTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['app.key' => 'base64:'.base64_encode(str_repeat('k', 32))]);
        $this->withoutVite();
    }

    private function user(string $role = 'admin'): User
    {
        $u = User::factory()->create();
        $u->role = $role;
        $u->save();

        return $u;
    }

    private function payload(array $extra = []): array
    {
        return array_replace_recursive(['slug' => 'test-publication', 'type' => 'article', 'featured' => false, 'image' => '/images/portrait.jpg', 'position' => 0, 'published_at' => now()->subMinute()->toDateTimeString(), 'translations' => ['en' => ['title' => 'Test publication', 'excerpt' => 'An introduction', 'body' => '<script>alert(1)</script>', 'status' => 'published']]], $extra);
    }

    public function test_public_site_and_security_headers(): void
    {
        $this->get('/')->assertRedirect('/en');
        $this->get('/en')->assertOk()->assertHeader('X-Frame-Options', 'DENY')->assertSee('csrf-token', false);
        $this->get('/de')->assertNotFound();
        $this->get('/en/not-a-page')->assertNotFound();
        $this->get('/admin')->assertHeader('X-Robots-Tag', 'noindex, nofollow');
    }

    public function test_unauthenticated_users_cannot_read_private_data(): void
    {
        $this->getJson('/api/admin/contents')->assertUnauthorized();
        $this->getJson('/api/admin/enquiries')->assertUnauthorized();
        $this->postJson('/api/admin/contents', $this->payload())->assertUnauthorized();
    }

    public function test_role_authorization(): void
    {
        $u = $this->user('visitor');
        $this->actingAs($u)->getJson('/api/admin/dashboard')->assertForbidden();
        $u = $this->user('editor');
        $this->actingAs($u)->putJson('/api/admin/settings', ['email' => 'office@example.com'])->assertForbidden();
    }

    public function test_publication_visibility_scheduling_and_locales(): void
    {
        $this->actingAs($this->user())->postJson('/api/admin/contents', $this->payload())->assertOk();
        $this->getJson('/api/content/en')->assertJsonCount(1, 'data');
        $this->getJson('/api/content/fr')->assertJsonCount(0, 'data');
        Content::first()->update(['published_at' => now()->addDay()]);
        $this->getJson('/api/content/en')->assertJsonCount(0, 'data');
        Content::first()->update(['published_at' => now()->subMinute(), 'translations' => ['en' => ['title' => 'Draft', 'status' => 'draft']]]);
        $this->getJson('/api/content/en')->assertJsonCount(0, 'data');
        $this->get('/en/articles/test-publication')->assertNotFound();
    }

    public function test_kreol_cannot_publish_without_human_review(): void
    {
        $this->actingAs($this->user())->postJson('/api/admin/contents', $this->payload(['translations' => ['km' => ['title' => 'Enn lartik', 'status' => 'published', 'reviewed' => false]]]))->assertUnprocessable();
        $this->postJson('/api/admin/contents', $this->payload(['translations' => ['km' => ['title' => 'Enn lartik', 'status' => 'published', 'reviewed' => true]]]))->assertOk();
        $this->getJson('/api/content/km')->assertJsonCount(1, 'data');
    }

    public function test_article_html_is_escaped_and_seo_is_rendered(): void
    {
        Content::create($this->payload());
        $this->get('/en/articles/test-publication')->assertOk()->assertSee('&lt;script&gt;alert(1)&lt;/script&gt;', false)->assertSee('rel="canonical"', false)->assertDontSee('<script>alert(1)</script>', false);
    }

    public function test_editor_cannot_delete_and_admin_can(): void
    {
        $c = Content::create($this->payload());
        $this->actingAs($this->user('editor'))->deleteJson('/api/admin/contents/'.$c->id)->assertForbidden();
        $this->actingAs($this->user())->deleteJson('/api/admin/contents/'.$c->id)->assertOk();
        $this->assertSoftDeleted('contents', ['id' => $c->id]);
        $this->assertDatabaseHas('activity_logs', ['action' => 'content.deleted']);
    }

    public function test_enquiries_validate_consent_and_honeypot(): void
    {
        $data = ['name' => 'Resident', 'email' => 'resident@example.com', 'subject' => 'Meeting request', 'kind' => 'appointment', 'message' => 'I would like an appointment.', 'locale' => 'en', 'consent' => true];
        $this->postJson('/api/enquiries', [...$data, 'consent' => false])->assertUnprocessable();
        $this->postJson('/api/enquiries', [...$data, 'website' => 'spam'])->assertUnprocessable();
        $this->postJson('/api/enquiries', $data)->assertCreated();
        $this->assertDatabaseHas('enquiries', ['kind' => 'appointment', 'status' => 'new']);
    }

    public function test_analytics_excludes_bots_dnt_and_staff(): void
    {
        $this->withHeaders(['User-Agent' => 'Test browser'])->get('/en')->assertOk();
        $this->assertDatabaseCount('page_views', 1);
        $this->withHeaders(['User-Agent' => 'Googlebot'])->get('/en');
        $this->assertDatabaseCount('page_views', 1);
        $this->withHeaders(['User-Agent' => 'Test browser', 'DNT' => '1'])->get('/en');
        $this->assertDatabaseCount('page_views', 1);
        $this->actingAs($this->user())->get('/en');
        $this->assertDatabaseCount('page_views', 1);
    }

    public function test_upload_rejects_executable_content(): void
    {
        Storage::fake('public');
        $this->actingAs($this->user())->postJson('/api/admin/media', ['file' => UploadedFile::fake()->create('shell.php', 1, 'text/x-php')])->assertUnprocessable();
        $this->postJson('/api/admin/media', ['file' => UploadedFile::fake()->image('portrait.jpg')])->assertCreated()->assertJsonStructure(['url']);
    }

    public function test_login_requires_valid_totp_and_rejects_replay(): void
    {
        $u = $this->user();
        $u->password = Hash::make('a-long-test-password');
        $g = new Google2FA;
        $u->two_factor_secret = $g->generateSecretKey();
        $u->save();
        $data = ['email' => $u->email, 'password' => 'a-long-test-password'];
        $this->postJson('/api/login', $data)->assertUnprocessable();
        $code = $g->getCurrentOtp($u->two_factor_secret);
        $this->postJson('/api/login', [...$data, 'code' => $code])->assertOk()->assertJsonStructure(['csrf', 'user']);
        $this->postJson('/api/logout')->assertOk();
        $this->postJson('/api/login', [...$data, 'code' => $code])->assertUnprocessable();
    }

    public function test_sitemap_does_not_expose_drafts(): void
    {
        Content::create($this->payload());
        Content::create($this->payload(['slug' => 'private-draft', 'translations' => ['en' => ['status' => 'draft']]]));
        $this->get('/sitemap.xml')->assertOk()->assertSee('test-publication')->assertDontSee('private-draft');
    }

    public function test_login_is_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', ['email' => 'none@example.com', 'password' => 'bad'])->assertUnprocessable();
        }$this->postJson('/api/login', ['email' => 'none@example.com', 'password' => 'bad'])->assertStatus(429);
    }

    public function test_production_rejects_staff_without_an_authenticator(): void
    {
        $u = $this->user();
        $u->password = Hash::make('production-test-password');
        $u->save();
        $this->app['env'] = 'production';
        $this->withSession(['_token' => 'production-test-csrf'])->postJson('/api/login', ['email' => $u->email, 'password' => 'production-test-password', '_token' => 'production-test-csrf'])->assertUnprocessable()->assertHeader('Strict-Transport-Security', 'max-age=31536000');
    }

    public function test_unsafe_urls_and_paths_are_rejected(): void
    {
        $this->actingAs($this->user())->postJson('/api/admin/contents', $this->payload(['source_url' => 'javascript:alert(1)']))->assertUnprocessable();
        $this->postJson('/api/admin/contents', $this->payload(['image' => 'https://tracker.example/image.jpg']))->assertUnprocessable();
    }

    public function test_staff_can_update_content_and_enquiry_status_with_audit_events(): void
    {
        $this->actingAs($this->user())->postJson('/api/admin/contents', $this->payload())->assertOk();
        $c = Content::first();
        $this->putJson('/api/admin/contents/'.$c->id, $this->payload(['translations' => ['en' => ['title' => 'Updated story']]]))->assertOk();
        $this->getJson('/api/content/en')->assertJsonPath('data.0.title', 'Updated story');
        $e = Enquiry::create(['name' => 'Test', 'email' => 'test@example.com', 'kind' => 'concern', 'subject' => 'Local issue', 'message' => 'A local test issue', 'locale' => 'en']);
        $this->patchJson('/api/admin/enquiries/'.$e->id, ['status' => 'closed'])->assertOk();
        $this->assertDatabaseHas('enquiries', ['id' => $e->id, 'status' => 'closed']);
        $this->assertDatabaseHas('activity_logs', ['action' => 'enquiry.updated']);
    }

    public function test_kreol_metadata_uses_mauritian_creole_language_tag(): void
    {
        $this->get('/km')->assertOk()->assertSee('lang="mfe"', false)->assertSee('hreflang="mfe"', false)->assertHeader('X-Robots-Tag', 'noindex, nofollow');
        $this->get('/robots.txt')->assertSee('Disallow: /admin')->assertSee('sitemap.xml');
    }
}
