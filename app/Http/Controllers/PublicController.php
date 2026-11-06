<?php
namespace App\Http\Controllers;
use App\Models\{Content,Enquiry,PageView};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class PublicController extends Controller {
 public function index(Request $request,string $locale='en',?string $section=null,?string $slug=null){
  abort_unless(in_array($locale,['en','fr','km'],true),404);
  $allowed=['about','parliament','constituency','perspectives','media','contact','articles','privacy','terms'];
  abort_if($section && !in_array($section,$allowed,true),404);
  abort_if(($slug && $section!=='articles') || ($section==='articles' && !$slug),404);
  $content=$slug?Content::published($locale)->where('slug',$slug)->firstOrFail():null;
  $titles=['en'=>'A life in law and public service','fr'=>'Une vie au service du droit et du public','km'=>'Enn lavi dan servis piblik'];
  $title=$content?($content->translations[$locale]['title']??''):($section?ucfirst($section):$titles[$locale]);
  $description=$content?($content->translations[$locale]['meta_description']??$content->translations[$locale]['excerpt']??''):'Khushal Lobine — Parliament, Constituency No. 15, ideas and public service.';
  $alternates=[];foreach(['en','fr','km'] as $l){if(!$content || (($content->translations[$l]['status']??'')==='published'))$alternates[$l]=url('/'.$l.($section?'/'.$section:'').($slug?'/'.$slug:''));}
  if(!$request->user() && $request->header('DNT')!=='1' && !preg_match('/bot|crawl|spider|preview|headless/i',$request->userAgent()??'')){
   PageView::create(['day'=>today(),'visitor'=>hash_hmac('sha256',today()->toDateString().'|'.$request->session()->getId(),config('app.key')),'path'=>'/'.$locale.($section?'/'.$section:'').($slug?'/'.$slug:''),'referrer'=>parse_url($request->header('referer',''),PHP_URL_HOST)?:null,'device'=>preg_match('/mobile|android|iphone/i',$request->userAgent()??'')?'mobile':'desktop']);
  }
  return view('app',compact('locale','title','description','alternates','content'));
 }
 public function contents(Request $request,string $locale){
  abort_unless(in_array($locale,['en','fr','km'],true),404);
  $query=Content::published($locale);
  if($request->filled('type'))$query->where('type',$request->string('type')->toString());
  if($request->filled('q')){$q=mb_substr($request->string('q')->toString(),0,100);$query->where("translations->{$locale}->title",'like','%'.$q.'%');}
  return response()->json(['data'=>$query->orderByDesc('featured')->orderBy('position')->latest('published_at')->limit(100)->get()->map(fn($c)=>$c->localized($locale))]);
 }
 public function settings(){return response()->json(DB::table('site_settings')->get()->mapWithKeys(fn($row)=>[$row->key=>json_decode($row->value,true)]));}
 public function enquiry(Request $request){
  $data=$request->validate(['name'=>'required|string|max:120','email'=>'required|email|max:254','subject'=>'required|string|max:180','kind'=>'required|in:general,concern,appointment,media','message'=>'required|string|min:10|max:5000','locale'=>'required|in:en,fr,km','consent'=>'accepted','website'=>'nullable|max:0']);
  Enquiry::create(collect($data)->except(['consent','website'])->all());
  return response()->json(['message'=>'Your message has been received.'],201);
 }
 public function sitemap(){
  $urls=[];foreach(['en','fr'] as $locale){foreach(['','about','parliament','constituency','perspectives','media','contact'] as $p)$urls[]=url('/'.$locale.($p?'/'.$p:''));foreach(Content::published($locale)->get() as $c)$urls[]=url('/'.$locale.'/articles/'.$c->slug);}
  $xml='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';foreach($urls as $url)$xml.='<url><loc>'.htmlspecialchars($url,ENT_XML1).'</loc></url>';return response($xml.'</urlset>',200,['Content-Type'=>'application/xml']);
 }
}
