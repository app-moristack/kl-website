<?php

namespace Tests\Feature;

use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class TrustedProxiesTest extends TestCase
{
    protected function tearDown(): void
    {
        TrustProxies::flushState();
        parent::tearDown();
    }

    public function test_forwarded_https_from_a_trusted_proxy_is_honoured(): void
    {
        TrustProxies::at(['10.0.0.0/8']);
        Route::get('/__scheme', fn () => request()->getScheme());

        $this->withServerVariables(['REMOTE_ADDR' => '10.1.2.3'])
            ->get('/__scheme', ['X-Forwarded-Proto' => 'https'])
            ->assertSee('https');
    }

    public function test_forwarded_https_from_an_untrusted_client_is_ignored(): void
    {
        TrustProxies::at(['10.0.0.0/8']);
        Route::get('/__scheme', fn () => request()->getScheme());

        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.9'])
            ->get('/__scheme', ['X-Forwarded-Proto' => 'https'])
            ->assertSee('http')
            ->assertDontSee('https');
    }
}
