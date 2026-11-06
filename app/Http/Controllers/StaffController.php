<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use App\Notifications\StaffInvitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class StaffController extends Controller
{
    private function admin(Request $r)
    {
        abort_unless($r->user()->role === 'admin', 403);
    }

    private function invite(User $u)
    {
        $token = Password::createToken($u);
        $u->notify(new StaffInvitation($token));
    }

    public function index(Request $r)
    {
        $this->admin($r);

        return response()->json(['data' => User::orderBy('name')->get()->map(fn ($u) => [...$u->only(['id', 'name', 'email', 'role', 'is_active', 'notify_enquiries', 'email_verified_at']), 'enrolled' => (bool) $u->two_factor_secret])]);
    }

    public function create(Request $r)
    {
        $this->admin($r);
        $d = $r->validate(['name' => 'required|string|max:120', 'email' => 'required|email|max:254|unique:users', 'role' => 'required|in:admin,editor']);
        $u = new User($d);
        $u->role = $d['role'];
        $u->password = Hash::make(Str::random(64));
        $u->save();
        $this->invite($u);
        ActivityLog::create(['user_id' => $r->user()->id, 'action' => 'staff.invited', 'details' => ['id' => $u->id]]);

        return response()->json(['id' => $u->id, 'message' => 'Invitation queued.'], 201);
    }

    public function update(Request $r, User $user)
    {
        $this->admin($r);
        $d = $r->validate(['name' => 'required|string|max:120', 'role' => 'required|in:admin,editor', 'is_active' => 'required|boolean', 'notify_enquiries' => 'required|boolean']);

        return DB::transaction(function () use ($r, $user, $d) {
            $admins = User::where('role', 'admin')->where('is_active', true)->lockForUpdate()->get();
            abort_if($user->id === $r->user()->id && (! $d['is_active'] || $d['role'] !== 'admin'), 422, 'You cannot disable or demote your own account.');
            abort_if($user->role === 'admin' && $user->is_active && (! $d['is_active'] || $d['role'] !== 'admin') && $admins->count() <= 1, 422, 'Keep at least one active administrator.');
            $user->forceFill($d)->save();
            if (! $user->is_active) {
                DB::table('sessions')->where('user_id', $user->id)->delete();
            }ActivityLog::create(['user_id' => $r->user()->id, 'action' => 'staff.updated', 'details' => ['id' => $user->id]]);

            return response()->json(['ok' => true]);
        });
    }

    public function resend(Request $r, User $user)
    {
        $this->admin($r);
        abort_unless($user->is_active, 422, 'Enable the staff account first.');
        $this->invite($user);

        return response()->json(['message' => 'Invitation queued.']);
    }

    public function forgot(Request $r)
    {
        $d = $r->validate(['email' => 'required|email']);
        $u = User::where('email', $d['email'])->where('is_active', true)->first();
        if ($u && in_array($u->role, ['admin', 'editor'], true)) {
            $this->invite($u);
        }

        return response()->json(['message' => 'If an active staff account exists, a one-time link has been queued.']);
    }

    private function tokenUser(Request $r): User
    {
        $r->validate(['email' => 'required|email', 'token' => 'required|string']);
        $u = User::where('email', $r->input('email'))->where('is_active', true)->first();
        abort_unless($u && Password::tokenExists($u, $r->input('token')), 422, 'This link is invalid or expired.');

        return $u;
    }

    public function prepare(Request $r)
    {
        $u = $this->tokenUser($r);
        if ($u->two_factor_secret) {
            return response()->json(['enrolled' => true]);
        }$secret = (new Google2FA)->generateSecretKey();
        $r->session()->put('staff_enrolment', ['user_id' => $u->id, 'hash' => hash('sha256', $r->input('token')), 'secret' => $secret, 'expires' => time() + 600]);

        return response()->json(['enrolled' => false, 'secret' => $secret, 'uri' => (new Google2FA)->getQRCodeUrl('KL Website', $u->email, $secret)]);
    }

    public function activate(Request $r)
    {
        $u = $this->tokenUser($r);
        $d = $r->validate(['password' => 'required|string|min:12|confirmed', 'code' => 'required|digits:6']);
        $setup = $r->session()->get('staff_enrolment');
        $secret = $u->two_factor_secret;
        if (! $secret) {
            abort_unless($setup && $setup['user_id'] === $u->id && $setup['expires'] >= time() && hash_equals($setup['hash'], hash('sha256', $r->input('token'))), 422, 'Restart authenticator setup.');
            $secret = $setup['secret'];
        }
        abort_unless((new Google2FA)->verifyKey($secret, $d['code'], 1), 422, 'Invalid authenticator code.');
        DB::transaction(function () use ($u, $secret, $d) {
            $u->forceFill(['password' => Hash::make($d['password']), 'two_factor_secret' => $secret, 'totp_bootstrap' => false, 'email_verified_at' => now(), 'remember_token' => Str::random(60)])->save();
            Password::deleteToken($u);
            DB::table('sessions')->where('user_id', $u->id)->delete();
        });
        $r->session()->forget('staff_enrolment');
        $r->session()->regenerate();

        return response()->json(['message' => 'Access configured. Sign in with your password and authenticator.', 'csrf' => csrf_token()]);
    }
}
