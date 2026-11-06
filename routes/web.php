<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{PublicController,AuthController,AdminController};
Route::redirect('/','/en');
Route::get('/sitemap.xml',[PublicController::class,'sitemap']);
Route::get('/robots.txt',fn()=>response("User-agent: *\nDisallow: /admin\nDisallow: /api/\nSitemap: ".url('/sitemap.xml')."\n",200,['Content-Type'=>'text/plain']));
Route::get('/admin',fn()=>view('app',['locale'=>'en','title'=>'Editorial dashboard','description'=>'Private administration','alternates'=>[]]));
Route::get('/api/session',[AuthController::class,'me']);
Route::post('/api/login',[AuthController::class,'login'])->middleware('throttle:5,1');
Route::post('/api/logout',[AuthController::class,'logout'])->middleware('auth');
Route::get('/api/settings',[PublicController::class,'settings']);
Route::get('/api/content/{locale}',[PublicController::class,'contents']);
Route::post('/api/enquiries',[PublicController::class,'enquiry'])->middleware('throttle:5,10');
Route::prefix('/api/admin')->middleware(['auth','admin','throttle:120,1'])->group(function(){
 Route::get('/dashboard',[AdminController::class,'dashboard']);Route::get('/contents',[AdminController::class,'contents']);
 Route::post('/contents',[AdminController::class,'save']);Route::put('/contents/{content}',[AdminController::class,'save']);Route::delete('/contents/{content}',[AdminController::class,'delete']);
 Route::get('/enquiries',[AdminController::class,'enquiries']);Route::patch('/enquiries/{enquiry}',[AdminController::class,'updateEnquiry']);
 Route::post('/media',[AdminController::class,'upload']);Route::put('/settings',[AdminController::class,'settings']);
});
Route::get('/{locale}/{section?}/{slug?}',[PublicController::class,'index'])->where('locale','en|fr|km');
