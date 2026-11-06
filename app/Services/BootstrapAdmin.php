<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class BootstrapAdmin
{
    public static function ensure(): string
    {
        return DB::transaction(function () {
            if (User::where('email', 'admin@nd.com')->exists()) {
                return 'exists';
            }
            $password = config('bootstrap_admin.password');
            if (! is_string($password) || $password === '') {
                return 'skipped';
            }
            if (strlen($password) < 12 || strlen($password) > 72) {
                throw new \RuntimeException('ADMIN_INITIAL_PASSWORD must contain between 12 and 72 bytes.');
            }
            $u = new User;
            $u->name = config('bootstrap_admin.name', 'Administrator');
            $u->email = 'admin@nd.com';
            $u->password = Hash::make($password);
            $u->role = 'admin';
            $u->is_active = true;
            $u->totp_bootstrap = true;
            $u->save();

            return 'created';
        });
    }
}
