<?php
namespace App\Http\Controllers;
use App\Models\{Content,Enquiry,PageView,ActivityLog};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
class AdminController extends Controller {
 private function log(Request $r,string $action,array $details=[]){ActivityLog::create(['user_id'=>$r->user()->id,'action'=>$action,'details'=>$details]);}
 public function dashboard(Request $request){
  $days=min(90,max(1,(int)$request->query('days',30)));$views=PageView::where('day','>=',today()->subDays($days-1));
  return response()->json(['contents'=>Content::count(),'enquiries'=>Enquiry::where('status','new')->count(),'page_views'=>(clone $views)->count(),'visitors'=>(clone $views)->distinct()->count('visitor'),'daily'=>(clone $views)->selectRaw('day, COUNT(*) as views, COUNT(DISTINCT visitor) as visitors')->groupBy('day')->orderBy('day')->get(),'top_pages'=>(clone $views)->selectRaw('path, COUNT(*) as views')->groupBy('path')->orderByDesc('views')->limit(8)->get(),'devices'=>(clone $views)->selectRaw('device, COUNT(*) as views')->groupBy('device')->get(),'activity'=>ActivityLog::latest()->limit(15)->get()]);
 }
 public function contents(){return response()->json(['data'=>Content::latest()->get()]);}
 public function save(Request $request,?Content $content=null){
  $data=$request->validate([
   'slug'=>['required','alpha_dash','max:180',Rule::unique('contents')->ignore($content?->id)],'type'=>'required|in:article,parliament,media,community,page',
   'category'=>'nullable|string|max:100','image'=>['nullable','string','max:255','regex:~^/(?:storage/media|images)/[a-zA-Z0-9._/-]+$~'],
   'source_url'=>'nullable|url:http,https|max:2048','event_date'=>'nullable|date','featured'=>'required|boolean','position'=>'integer|min:0|max:9999','published_at'=>'nullable|date',
   'translations'=>'required|array:en,fr,km','translations.*'=>'array:title,excerpt,body,status,meta_description,reviewed',
   'translations.*.title'=>'required|string|max:180','translations.*.excerpt'=>'nullable|string|max:500','translations.*.body'=>'nullable|string|max:100000',
   'translations.*.status'=>'required|in:draft,review,approved,published','translations.*.meta_description'=>'nullable|string|max:170','translations.*.reviewed'=>'boolean',
  ]);
  if(($data['translations']['km']['status']??'')==='published' && !($data['translations']['km']['reviewed']??false))return response()->json(['message'=>'Kreol requires human review before publication.'],422);
  $data['updated_by']=$request->user()->id;$content??=new Content;$content->fill($data)->save();$this->log($request,'content.saved',['id'=>$content->id,'slug'=>$content->slug]);return response()->json($content);
 }
 public function delete(Request $request,Content $content){abort_unless($request->user()->role==='admin',403);$id=$content->id;$content->delete();$this->log($request,'content.deleted',['id'=>$id]);return response()->json(['ok'=>true]);}
 public function enquiries(){return response()->json(['data'=>Enquiry::latest()->limit(200)->get()]);}
 public function updateEnquiry(Request $request,Enquiry $enquiry){$enquiry->update($request->validate(['status'=>'required|in:new,in_progress,closed']));$this->log($request,'enquiry.updated',['id'=>$enquiry->id]);return response()->json($enquiry);}
 public function upload(Request $request){$request->validate(['file'=>'required|file|mimes:jpg,jpeg,png,webp|max:5120']);$path=$request->file('file')->store('media','public');$this->log($request,'media.uploaded',['path'=>$path]);return response()->json(['url'=>'/storage/'.$path],201);}
 public function settings(Request $request){
  abort_unless($request->user()->role==='admin',403);
  $data=$request->validate(['email'=>'nullable|email|max:254','phone'=>'nullable|string|max:50','address'=>'nullable|string|max:250','whatsapp'=>'nullable|url:https|max:500','party_url'=>'nullable|url:https|max:500']);
  foreach($data as $key=>$value)DB::table('site_settings')->updateOrInsert(['key'=>$key],['value'=>json_encode($value),'updated_at'=>now(),'created_at'=>now()]);
  $this->log($request,'settings.updated');return response()->json(['ok'=>true]);
 }
}
