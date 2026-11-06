<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use PragmaRX\Google2FA\Google2FA;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required|string', 'code' => 'nullable|string|max:10']);
        $user = User::where('email', $data['email'])->first();
        $valid = $user && $user->is_active && Hash::check($data['password'], $user->password) && in_array($user->role, ['admin', 'editor'], true);
        if ($valid && $user->totp_bootstrap && ! $user->two_factor_secret) {
            $setup = $request->session()->get('initial_admin_totp');
            if (! $setup || $setup['user_id'] !== $user->id || $setup['expires'] < time()) {
                $setup = ['user_id' => $user->id, 'secret' => (new Google2FA)->generateSecretKey(), 'expires' => time() + 600];
                $request->session()->put('initial_admin_totp', $setup);
            }
            if (empty($data['code'])) {
                return response()->json(['requires_enrolment' => true, 'secret' => $setup['secret'], 'csrf' => csrf_token()]);
            }
            if (! (new Google2FA)->verifyKey($setup['secret'], $data['code'], 1)) {
                return response()->json(['message' => 'Invalid authenticator code.'], 422);
            }
            $user = DB::transaction(function () use ($user, $setup) {
                $fresh = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
                if (! $fresh->two_factor_secret && $fresh->totp_bootstrap) {
                    $fresh->forceFill(['two_factor_secret' => $setup['secret'], 'totp_bootstrap' => false])->save();
                }

                return $fresh;
            });
            $request->session()->forget('initial_admin_totp');
        }
        if ($valid && $user->two_factor_secret) {
            $valid = (new Google2FA)->verifyKey($user->two_factor_secret, $data['code'] ?? '', 1);
            if ($valid) {
                $key = 'totp:'.$user->id.':'.($data['code'] ?? '');
                if (RateLimiter::tooManyAttempts($key, 1)) {
                    $valid = false;
                } else {
                    RateLimiter::hit($key, 90);
                }
            }
        } elseif ($valid && app()->isProduction()) {
            $valid = false;
        }
        if (! $valid) {
            return response()->json(['message' => 'Invalid credentials or authenticator code.'], 422);
        }
        Auth::login($user, false);
        $request->session()->regenerate();

        return response()->json(['user' => ['name' => $user->name, 'role' => $user->role], 'csrf' => csrf_token()]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['ok' => true]);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => ($request->user()?->is_active ? $request->user() : null)?->only(['id', 'name', 'email', 'role'])]);
    }
}
