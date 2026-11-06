<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
class SecurityHeaders {
 public function handle(Request $request, Closure $next) {
  $response=$next($request);
  $response->headers->set('X-Content-Type-Options','nosniff');
  $response->headers->set('X-Frame-Options','DENY');
  $response->headers->set('Referrer-Policy','strict-origin-when-cross-origin');
  $response->headers->set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  if(app()->isProduction()) {
   $response->headers->set('Strict-Transport-Security','max-age=31536000');
   $response->headers->set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests");
  }
  if($request->is('km*')) $response->headers->set('X-Robots-Tag','noindex, nofollow');
  if($request->is('admin*') || $request->is('api/admin*')) {
   $response->headers->set('Cache-Control','no-store');
   $response->headers->set('X-Robots-Tag','noindex, nofollow');
  }
  return $response;
 }
}
