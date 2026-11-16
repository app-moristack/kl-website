<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\Page;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminReviewTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $u = User::factory()->create(['role' => 'admin']);
        $this->actingAs($u);
    }

    public function test_changed_reviewed_kreol_publication_returns_to_draft_on_the_server(): void
    {
        $content = Content::create(['slug' => 'review-guard', 'type' => 'article', 'featured' => false, 'published_at' => now()->subMinute(), 'translations' => ['en' => ['title' => 'English title', 'status' => 'published'], 'km' => ['title' => 'Original Kreol title', 'body' => 'Original text', 'status' => 'published', 'reviewed' => true]]]);
        $translations = $content->translations;
        $translations['km']['body'] = 'Changed text';
        $this->putJson('/api/admin/contents/'.$content->id, ['slug' => $content->slug, 'type' => $content->type, 'featured' => false, 'version' => 0, 'published_at' => $content->published_at->toIso8601String(), 'translations' => $translations])->assertOk()->assertJsonPath('translations.km.reviewed', false)->assertJsonPath('translations.km.status', 'draft')->assertJsonPath('translations.en.status', 'published');
        $this->getJson('/api/content/km/review-guard')->assertNotFound();
        $this->getJson('/api/content/en/review-guard')->assertOk();
    }

    public function test_changed_kreol_gallery_captions_require_review_again(): void
    {
        $content = Content::create(['slug' => 'gallery-review', 'type' => 'gallery', 'featured' => false, 'published_at' => now()->subMinute(), 'translations' => ['km' => ['title' => 'Review fixture', 'status' => 'published', 'reviewed' => true]], 'gallery' => [['image' => '/images/portrait.jpg', 'translations' => ['km' => ['caption' => 'Original caption']]]]]);
        $gallery = $content->gallery;
        $gallery[0]['translations']['km']['caption'] = 'Changed caption';
        $this->putJson('/api/admin/contents/'.$content->id, ['slug' => $content->slug, 'type' => $content->type, 'featured' => false, 'version' => 0, 'translations' => $content->translations, 'gallery' => $gallery])->assertOk()->assertJsonPath('translations.km.reviewed', false)->assertJsonPath('translations.km.status', 'draft');
    }

    public function test_changed_legal_text_cannot_reuse_an_earlier_owner_approval(): void
    {
        $page = Page::create(['slug' => 'privacy', 'translations' => ['en' => ['hero_title' => 'Privacy', 'intro_body' => 'Earlier wording', 'status' => 'published', 'reviewed' => true, 'legal_approved' => true]]]);
        $translations = $page->translations;
        $translations['en']['intro_body'] = 'Changed legal wording';
        $this->putJson('/api/admin/pages/'.$page->id, ['version' => 0, 'translations' => $translations])->assertOk()->assertJsonPath('translations.en.legal_approved', false)->assertJsonPath('translations.en.status', 'draft');
        $this->getJson('/api/pages/en')->assertJsonMissingPath('data.privacy');
    }

    public function test_unchanged_kreol_copy_can_be_explicitly_approved_in_a_later_save(): void
    {
        $page = Page::create(['slug' => 'home', 'translations' => ['km' => ['hero_title' => 'Review fixture', 'status' => 'review', 'reviewed' => false]]]);
        $translations = $page->translations;
        $translations['km']['reviewed'] = true;
        $translations['km']['status'] = 'published';
        $this->putJson('/api/admin/pages/'.$page->id, ['version' => 0, 'translations' => $translations])->assertOk()->assertJsonPath('translations.km.status', 'published')->assertJsonPath('translations.km.reviewed', true);
    }

    public function test_footer_social_urls_are_configurable_and_require_https(): void
    {
        $this->putJson('/api/admin/settings', ['facebook' => 'https://www.facebook.com/review', 'instagram' => 'https://www.instagram.com/review', 'youtube' => 'https://www.youtube.com/@review', 'linkedin' => 'https://www.linkedin.com/in/review'])->assertOk();
        $this->getJson('/api/settings')->assertJsonPath('facebook', 'https://www.facebook.com/review');
        $this->putJson('/api/admin/settings', ['facebook' => 'javascript:alert(1)'])->assertUnprocessable();
    }
}
