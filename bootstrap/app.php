<?php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(web: __DIR__.'/../routes/web.php', commands: __DIR__.'/../routes/console.php', health: '/up')
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(headers: \Illuminate\Http\Request::HEADER_X_FORWARDED_FOR | \Illuminate\Http\Request::HEADER_X_FORWARDED_PROTO | \Illuminate\Http\Request::HEADER_X_FORWARDED_PORT);
        $middleware->web(append: [\App\Http\Middleware\SecurityHeaders::class]);
        $middleware->alias(['admin' => \App\Http\Middleware\RequireAdmin::class]);
        $middleware->redirectGuestsTo('/admin');
    })->withExceptions(function (Exceptions $exceptions): void {})->create();
