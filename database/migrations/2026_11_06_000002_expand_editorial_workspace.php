<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $t) {
            $t->boolean('is_active')->default(true);
            $t->boolean('notify_enquiries')->default(true);
        });
        Schema::table('contents', function (Blueprint $t) {
            $t->softDeletes();
            $t->unsignedInteger('version')->default(0);
            $t->string('parliament_kind')->nullable()->index();
            $t->unsignedSmallInteger('session_year')->nullable();
            $t->string('question_number')->nullable();
            $t->string('ministry')->nullable();
            $t->json('topics')->nullable();
            $t->string('video_url', 2048)->nullable();
            $t->json('attachments')->nullable();
            $t->json('gallery')->nullable();
        });
        Schema::create('pages', function (Blueprint $t) {
            $t->id();
            $t->string('slug')->unique();
            $t->json('translations');
            $t->unsignedInteger('version')->default(0);
            $t->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });
        Schema::create('revisions', function (Blueprint $t) {
            $t->id();
            $t->string('subject_type');
            $t->unsignedBigInteger('subject_id');
            $t->unsignedInteger('version');
            $t->json('snapshot');
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->string('action');
            $t->timestamps();
            $t->index(['subject_type', 'subject_id']);
        });
        Schema::create('media_assets', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('path');
            $t->string('kind');
            $t->string('mime');
            $t->unsignedBigInteger('bytes');
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['media_assets', 'revisions', 'pages'] as $table) {
            Schema::dropIfExists($table);
        }Schema::table('contents', fn (Blueprint $t) => $t->dropColumn(['deleted_at', 'version', 'parliament_kind', 'session_year', 'question_number', 'ministry', 'topics', 'video_url', 'attachments', 'gallery']));
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn(['is_active', 'notify_enquiries']));
    }
};
