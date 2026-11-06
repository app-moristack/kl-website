<?php

use App\Services\BootstrapAdmin;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', fn (Blueprint $t) => $t->boolean('totp_bootstrap')->default(false));
        BootstrapAdmin::ensure();
    }

    public function down(): void
    {
        // Preserve the account and its editorial history when rolling back schema.
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('totp_bootstrap'));
    }
};
