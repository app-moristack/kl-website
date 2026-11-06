<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $t) {
            $t->string('role')->default('editor');
            $t->text('two_factor_secret')->nullable();
        });
        Schema::create('contents', function (Blueprint $t) {
            $t->id();
            $t->string('slug')->unique();
            $t->string('type')->index();
            $t->string('category')->nullable();
            $t->json('translations');
            $t->string('image')->nullable();
            $t->string('source_url', 2048)->nullable();
            $t->date('event_date')->nullable();
            $t->boolean('featured')->default(false);
            $t->unsignedInteger('position')->default(0);
            $t->timestamp('published_at')->nullable()->index();
            $t->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });
        Schema::create('enquiries', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('email');
            $t->string('subject');
            $t->string('kind');
            $t->text('message');
            $t->string('locale', 5);
            $t->string('status')->default('new');
            $t->timestamps();
        });
        Schema::create('page_views', function (Blueprint $t) {
            $t->id();
            $t->date('day')->index();
            $t->string('visitor', 64)->index();
            $t->string('path');
            $t->string('referrer')->nullable();
            $t->string('device', 20);
            $t->timestamps();
        });
        Schema::create('activity_logs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->string('action');
            $t->json('details')->nullable();
            $t->timestamps();
        });
        Schema::create('site_settings', function (Blueprint $t) {
            $t->string('key')->primary();
            $t->json('value');
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['site_settings', 'activity_logs', 'page_views', 'enquiries', 'contents'] as $table) {
            Schema::dropIfExists($table);
        }Schema::table('users', function (Blueprint $t) {
            $t->dropColumn(['role', 'two_factor_secret']);
        });
    }
};
