<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\BootstrapAdmin;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class BootstrapAdministratorTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['app.key' => 'base64:'.base64_encode(str_repeat('k', 32))]);
        $this->withoutVite();
    }

    public function test_migration_creates_hashed_admin_from_environment_config_without_overwriting(): void
    {
        config(['bootstrap_admin.password' => 'Only-a-disposable-test-password']);
        $this->artisan('migrate:fresh', ['--force' => true])->assertExitCode(0);
        $u = User::where('email', 'admin@nd.com')->firstOrFail();
        $this->assertSame('admin', $u->role);
        $this->assertTrue($u->totp_bootstrap);
        $this->assertTrue(Hash::check('Only-a-disposable-test-password', $u->password));
        $hash = $u->password;
        config(['bootstrap_admin.password' => 'A-different-disposable-password']);
        $this->assertSame('exists', BootstrapAdmin::ensure());
        $this->assertSame($hash, $u->fresh()->password);
    }

    public function test_blank_password_skips_creation_and_command_can_bootstrap_later(): void
    {
        config(['bootstrap_admin.password' => null]);
        $this->artisan('migrate:fresh', ['--force' => true])->assertExitCode(0);
        $this->assertDatabaseMissing('users', ['email' => 'admin@nd.com']);
        config(['bootstrap_admin.password' => 'Only-a-disposable-test-password']);
        $this->artisan('admin:bootstrap')->assertExitCode(0);
        $this->assertDatabaseHas('users', ['email' => 'admin@nd.com', 'role' => 'admin']);
    }

    public function test_first_signin_requires_authenticator_enrolment_before_authentication(): void
    {
        config(['bootstrap_admin.password' => 'Only-a-disposable-test-password']);
        $this->artisan('migrate:fresh', ['--force' => true])->assertExitCode(0);
        $login = ['email' => 'admin@nd.com', 'password' => 'Only-a-disposable-test-password'];
        $r = $this->postJson('/api/login', $login)->assertOk()->assertJsonPath('requires_enrolment', true);
        $this->assertGuest();
        $secret = $r->json('secret');
        $this->postJson('/api/login', [...$login, 'code' => (new Google2FA)->getCurrentOtp($secret)])->assertOk()->assertJsonPath('user.role', 'admin');
        $this->assertAuthenticated();
        $u = User::where('email', 'admin@nd.com')->first();
        $this->assertFalse($u->totp_bootstrap);
        $this->assertSame($secret, $u->two_factor_secret);
        $this->assertNotSame($secret,$u->getRawOriginal('two_factor_secret'));
    }
}
