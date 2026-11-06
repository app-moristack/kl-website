<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use App\Models\User;
use PragmaRX\Google2FA\Google2FA;
class AuthController extends Controller {
 public function login(Request $request) {
  $data=$request->validate(['email'=>'required|email','password'=>'required|string','code'=>'nullable|string|max:10']);
  $user=User::where('email',$data['email'])->first();
  $valid=$user && Hash::check($data['password'],$user->password) && in_array($user->role,['admin','editor'],true);
  if($valid && $user->two_factor_secret){
   $valid=(new Google2FA)->verifyKey($user->two_factor_secret,$data['code']??'',1);
   if($valid){$key='totp:'.$user->id.':'.($data['code']??'');if(RateLimiter::tooManyAttempts($key,1))$valid=false;else RateLimiter::hit($key,90);}
  } elseif($valid && app()->isProduction()) $valid=false;
  if(!$valid) return response()->json(['message'=>'Invalid credentials or authenticator code.'],422);
  Auth::login($user,false);$request->session()->regenerate();
  return response()->json(['user'=>['name'=>$user->name,'role'=>$user->role],'csrf'=>csrf_token()]);
 }
 public function logout(Request $request){Auth::logout();$request->session()->invalidate();$request->session()->regenerateToken();return response()->json(['ok'=>true]);}
 public function me(Request $request){return response()->json(['user'=>$request->user()?->only(['id','name','email','role'])]);}
}
