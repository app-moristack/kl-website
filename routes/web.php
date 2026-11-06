<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\StaffController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/en');
Route::get('/sitemap.xml', [PublicController::class, 'sitemap']);
Route::get('/robots.txt', fn () => response("User-agent: *\nDisallow: /admin\nDisallow: /api/\nSitemap: ".url('/sitemap.xml')."\n", 200, ['Content-Type' => 'text/plain']));
Route::get('/admin/activate', fn () => view('app', ['locale' => 'en', 'title' => 'Staff access', 'description' => 'Private staff setup', 'alternates' => []]));
Route::post('/api/staff/forgot', [StaffController::class, 'forgot'])->middleware('throttle:3,10');
Route::post('/api/staff/prepare', [StaffController::class, 'prepare'])->middleware('throttle:10,10');
Route::post('/api/staff/activate', [StaffController::class, 'activate'])->middleware('throttle:5,10');
Route::get('/api/pages/{locale}', [PageController::class, 'published']);
Route::get('/documents/{asset}', [MediaController::class, 'download']);
Route::get('/api/content/{locale}/{slug}', [PublicController::class, 'showContent']);
Route::get('/admin', fn () => view('app', ['locale' => 'en', 'title' => 'Editorial dashboard', 'description' => 'Private administration', 'alternates' => []]));
Route::get('/api/session', [AuthController::class, 'me']);
Route::post('/api/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/api/logout', [AuthController::class, 'logout'])->middleware('auth');
Route::get('/api/settings', [PublicController::class, 'settings']);
Route::get('/api/content/{locale}', [PublicController::class, 'contents']);
Route::post('/api/enquiries', [PublicController::class, 'enquiry'])->middleware('throttle:5,10');
Route::prefix('/api/admin')->middleware(['auth', 'admin', 'throttle:120,1'])->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/contents', [AdminController::class, 'contents']);
    Route::post('/contents', [AdminController::class, 'save']);
    Route::put('/contents/{content}', [AdminController::class, 'save']);
    Route::delete('/contents/{content}', [AdminController::class, 'delete']);
    Route::get('/enquiries', [AdminController::class, 'enquiries']);
    Route::patch('/enquiries/{enquiry}', [AdminController::class, 'updateEnquiry']);
    Route::get('/pages', [PageController::class, 'index']);
    Route::put('/pages/{page}', [PageController::class, 'save']);
    Route::get('/revisions', [PageController::class, 'revisions']);
    Route::post('/revisions/{revision}/restore', [PageController::class, 'restore']);
    Route::get('/staff', [StaffController::class, 'index']);
    Route::post('/staff', [StaffController::class, 'create']);
    Route::put('/staff/{user}', [StaffController::class, 'update']);
    Route::post('/staff/{user}/invite', [StaffController::class, 'resend'])->middleware('throttle:5,10');
    Route::get('/media', [MediaController::class, 'index']);
    Route::post('/media', [MediaController::class, 'upload']);
    Route::get('/media/{asset}', [MediaController::class, 'staffDownload']);
    Route::put('/settings', [AdminController::class, 'settings']);
});
Route::get('/{locale}/{section?}/{slug?}', [PublicController::class, 'index'])->where('locale', 'en|fr|km');
