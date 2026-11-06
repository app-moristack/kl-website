<?php

namespace App\Http\Middleware;

use App\Models\Content;
use App\Models\Page;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        if (app()->isProduction()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000');
            $response->headers->set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src https://www.youtube-nocookie.com https://player.vimeo.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests");
        }
        if ($request->is('km*')) {
            $section = $request->segment(2) ?: 'home';
            $approved = $section === 'articles' ? Content::published('km')->where('slug', $request->segment(3))->exists() : (Page::where('slug', $section)->first()?->published('km') ?? false);
            if (! $approved || ! json_decode(DB::table('site_settings')->where('key', 'kreol_interface_approved')->value('value') ?? 'false', true)) {
                $response->headers->set('X-Robots-Tag', 'noindex, nofollow');
            }
        }
        if ($request->is('admin*') || $request->is('api/admin*') || $request->is('api/staff*') || $request->is('api/login') || $request->is('api/session')) {
            $response->headers->set('Cache-Control', 'no-store');
            $response->headers->set('X-Robots-Tag', 'noindex, nofollow');
        }

        return $response;
    }
}
