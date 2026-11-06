<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
return new class extends Migration {
 public function up(): void {
  $changes = json_decode('{"home": {"quote": ["", "My responsibility as a Member of Parliament begins with the people who elected me."], "signature": ["", "KHUSHAL LOBINE"], "milestones": [[{"year": "2019", "title": "Elected to Parliament", "body": "Elected for La Caverne and Phoenix."}, {"year": "2024", "title": "Re-elected to Parliament", "body": "Re-elected in Constituency No. 15."}], [{"year": "2019", "title": "First elected to Parliament", "body": ""}, {"year": "2024", "title": "Re-elected for a second term", "body": ""}, {"year": "22+", "title": "Years of legal experience", "body": ""}, {"year": "2024", "title": "Nouveaux Démocrates founded", "body": ""}]]}, "about": {"quote": ["", "My commitment is simple: serve with integrity, act with courage, and put people first. I believe in a Mauritius where everyone has the opportunity to thrive — a fairer, more inclusive and prosperous nation."], "signature": ["", "KHUSHAL LOBINE"], "hero_body": ["Discover his background in law, parliamentary work and public engagement.", "A commitment to a fairer, more inclusive and prosperous Mauritius. Khushal Lobine is a barrister-at-law, Member of Parliament and Leader of Nouveaux Démocrates."], "milestones": [[{"year": "2019", "title": "Elected to Parliament", "body": "Elected for La Caverne and Phoenix."}, {"year": "2024", "title": "Re-elected to Parliament", "body": "Re-elected in Constituency No. 15."}], [{"year": "", "title": "Legal Studies in the UK", "body": "Completed legal studies in the United Kingdom."}, {"year": "", "title": "Called to the Bar", "body": "Called to the Bar as a barrister-at-law."}, {"year": "", "title": "Legal Career", "body": "Practised as a barrister, building a strong legal career."}, {"year": "", "title": "Chairman, SICOM Group", "body": "Chaired the board of the State Investment Corporation of Mauritius."}, {"year": "", "title": "Chairman, Wastewater Management Authority", "body": "Chaired the board of the Wastewater Management Authority."}, {"year": "2019", "title": "Elected as MP", "body": "Elected Member of Parliament in 2019."}, {"year": "2024", "title": "Founded Nouveaux Démocrates", "body": "Founded and now leads Nouveaux Démocrates."}, {"year": "2024", "title": "Re-elected", "body": "Re-elected as Member of Parliament in 2024."}]]}, "constituency": {"quote": ["", "I remain committed to being accessible, listening to your concerns, and working together for a stronger, safer and more inclusive La Caverne and Phoenix. Your voice matters, and I will continue to be present, on the ground and in Parliament."], "signature": ["", "KHUSHAL LOBINE"]}}', true);
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
