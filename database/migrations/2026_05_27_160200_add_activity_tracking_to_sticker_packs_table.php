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
        Schema::table('sticker_packs', function (Blueprint $table) {
            $table->foreignId('activity_id')->nullable()->after('album_id')->constrained('activities')->nullOnDelete();
            $table->foreignId('activity_checkin_id')->nullable()->after('activity_id')->constrained('activity_checkins')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sticker_packs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('activity_checkin_id');
            $table->dropConstrainedForeignId('activity_id');
        });
    }
};
