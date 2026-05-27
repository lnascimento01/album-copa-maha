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
        Schema::create('sticker_pack_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sticker_pack_id')->constrained('sticker_packs')->cascadeOnDelete();
            $table->foreignId('sticker_id')->constrained('stickers')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['sticker_pack_id', 'sticker_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sticker_pack_items');
    }
};
