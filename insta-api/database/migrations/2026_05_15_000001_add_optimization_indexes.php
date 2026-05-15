<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->index('created_at');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->index(['sender_id', 'created_at']);
            $table->index(['receiver_id', 'created_at']);
        });

        Schema::table('friendships', function (Blueprint $table) {
            $table->index('status');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['user_id', 'created_at']);
        });

        Schema::table('likes', function (Blueprint $table) {
            $table->index(['user_id', 'post_id']);
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex(['sender_id', 'created_at']);
            $table->dropIndex(['receiver_id', 'created_at']);
        });

        Schema::table('friendships', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'created_at']);
        });

        Schema::table('likes', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'post_id']);
        });
    }
};
