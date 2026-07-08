<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reward_code_allowed_users', function (Blueprint $table) {
            $table->foreignId('reward_code_id')->constrained('reward_codes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('added_at')->useCurrent();

            $table->primary(['reward_code_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reward_code_allowed_users');
    }
};
