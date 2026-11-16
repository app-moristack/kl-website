<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\Page;
use App\Models\Revision;
return new class extends Migration {
 public function up(): void {
  DB::transaction(function () {
   foreach (json_decode(file_get_contents(database_path('data/template-pages.json')), true) as $definition) {
    $page = Page::where('slug', $definition['slug'])->first();
    if (!$page) continue;
    if ($page->exists) {
     Revision::create(['subject_type'=>'page','subject_id'=>$page->id,'version'=>$page->version,'snapshot'=>$page->toArray(),'user_id'=>null,'action'=>'before_template_rework']);
    }
    $page->translations = $definition['translations'];
    $page->version = ($page->version ?? 0) + 1;
    $page->save();
    Revision::create(['subject_type'=>'page','subject_id'=>$page->id,'version'=>$page->version,'snapshot'=>$page->toArray(),'user_id'=>null,'action'=>'template_rework']);
   }
  });
 }
 public function down(): void { /* Keep editorial revisions restorable as unpublished drafts. */ }
};