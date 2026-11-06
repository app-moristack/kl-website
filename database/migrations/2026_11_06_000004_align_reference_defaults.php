<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
return new class extends Migration {
 public function up(): void {
  $changes = json_decode('{"home": {"section_title": ["Working with people", "Parliament. People. Perspectives."], "hero_body": ["Member of Parliament for Constituency No. 15 — La Caverne and Phoenix. Barrister-at-law.", "Drawing on more than two decades in legal practice and institutional governance, Khushal Lobine serves his constituency while contributing to legislative and national affairs."], "secondary_label": ["Parliamentary work", "Explore parliamentary work"]}, "about": {"hero_title": ["Law, leadership", "About"], "hero_accent": ["and public service", "Khushal Lobine"], "intro_title": ["Law, Leadership and Public Service", "Law, Leadership and Public Service"]}, "parliament": {"hero_title": ["Parliamentary", "PARLIAMENTARY"], "hero_accent": ["work", "WORK"], "section_title": ["Working with people", "Advancing a Fairer and Stronger Mauritius"]}, "constituency": {"hero_title": ["La Caverne &", "La Caverne &"], "hero_accent": ["Phoenix", "Phoenix"], "intro_title": ["Law, Leadership and Public Service", "Representing La Caverne & Phoenix"]}, "perspectives": {"hero_title": ["Ideas for a", "Ideas for a"], "hero_accent": ["stronger Mauritius", "Stronger Mauritius"], "section_title": ["Working with people", "Building a better Mauritius through ideas and dialogue."]}, "media": {"hero_title": ["Khushal Lobine", "Khushal Lobine"], "hero_accent": ["in the media", "in the Media"]}, "contact": {"hero_title": ["Your voice", "GET IN TOUCH"], "hero_accent": ["matters", "WITH KHUSHAL"]}}', true);
  foreach ($changes as $slug => $fields) {
   $page = DB::table('pages')->where('slug', $slug)->first();
   if (!$page) continue;
   $translations = json_decode($page->translations, true);
   foreach ($fields as $key => [$old, $new]) {
    if (($translations['en'][$key] ?? null) === $old) $translations['en'][$key] = $new;
   }
   DB::table('pages')->where('id', $page->id)->update(['translations'=>json_encode($translations, JSON_UNESCAPED_UNICODE)]);
  }
 }
 public function down(): void { /* Preserve editorial content on rollback. */ }
};
