<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_stickers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('sticker_id')->constrained('stickers')->cascadeOnDelete();
            $table->string('source')->nullable();
            $table->unsignedBigInteger('source_id')->nullable();
            $table->timestamp('unlocked_at');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['user_id', 'sticker_id']);
            $table->index(['user_id', 'source']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_stickers');
    }
};
