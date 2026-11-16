<?php
namespace Tests\Feature;
use App\Models\Page;
use App\Models\Revision;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
class TemplateReworkTest extends TestCase {
 use RefreshDatabase;
 public function test_existing_editorial_copy_can_be_restored_after_template_update(): void {
  $this->withoutVite();
  $this->seed();
  $page=Page::where('slug','home')->first();
  $translations=$page->translations;
  $translations['en']['intro_body']='An earlier owner edit that must remain recoverable.';
  $page->translations=$translations;
  $page->save();
  $migration=require database_path('migrations/2026_11_16_000001_match_supplied_templates.php');
  $migration->up();
  $page->refresh();
  $snapshot=Revision::where('subject_id',$page->id)->where('subject_type','page')->where('action','before_template_rework')->firstOrFail();
  $this->assertSame($translations['en']['intro_body'],$snapshot->snapshot['translations']['en']['intro_body']);
  $this->getJson('/api/pages/en')->assertJsonPath('data.home.hero_title','Khushal');
  $this->getJson('/api/pages/fr')->assertJsonPath('data.home.section_title','Actualités, travail parlementaire et engagement local');
  $this->getJson('/api/pages/km')->assertJsonMissingPath('data.home');
  $this->assertFalse($page->translations['km']['reviewed']);
  $user=User::factory()->create(['role'=>'admin']);
  $this->actingAs($user)->postJson('/api/admin/revisions/'.$snapshot->id.'/restore',['version'=>$page->version])->assertOk()->assertJsonPath('translations.en.status','draft')->assertJsonPath('translations.en.intro_body',$translations['en']['intro_body']);
  $this->getJson('/api/pages/en')->assertJsonMissingPath('data.home');
 }
}