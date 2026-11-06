<?php

use App\Models\PageView;
use App\Models\User;
use App\Services\BootstrapAdmin;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schedule;
use PragmaRX\Google2FA\Google2FA;

Artisan::command('admin:create {email} {--editor}', function () {
    $password = $this->secret('Password (minimum 12 characters)');
    if (strlen($password ?? '') < 12) {
        $this->error('Password must be at least 12 characters.');

        return 1;
    }
    if (! filter_var($this->argument('email'), FILTER_VALIDATE_EMAIL)) {
        $this->error('Invalid email');

        return 1;
    }
    if (User::where('email', $this->argument('email'))->exists()) {
        $this->error('User already exists.');

        return 1;
    }
    $g = new Google2FA;
    $secret = $g->generateSecretKey();
    $u = new User;
    $u->name = $this->ask('Display name', 'Editor');
    $u->email = $this->argument('email');
    $u->password = Hash::make($password);
    $u->role = $this->option('editor') ? 'editor' : 'admin';
    $u->two_factor_secret = $secret;
    $u->save();
    $this->info('Add this secret to your authenticator app and store it securely: '.$secret);
    $this->line($g->getQRCodeUrl('KL Website', $u->email, $secret));
})->purpose('Create an administrator with mandatory authenticator authentication');
Schedule::call(fn () => PageView::where('day', '<', today()->subDays(90))->delete())->daily();

Artisan::command('admin:bootstrap', function () {
    $status = BootstrapAdmin::ensure();
    $this->info(match ($status) {
        'created' => 'Created admin@nd.com. Complete authenticator enrolment on first sign-in.','exists' => 'admin@nd.com already exists; credentials were left unchanged.',default => 'No administrator created. Set ADMIN_INITIAL_PASSWORD in the environment first.'
    });
})->purpose('Idempotently bootstrap admin@nd.com from the configured initial password');
