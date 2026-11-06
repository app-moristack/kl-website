<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RequireAdmin
{
    public function handle(Request $request, Closure $next)
    {
        abort_unless($request->user() && $request->user()->is_active && in_array($request->user()->role, ['admin', 'editor'], true), 403);

        return $next($request);
    }
}
