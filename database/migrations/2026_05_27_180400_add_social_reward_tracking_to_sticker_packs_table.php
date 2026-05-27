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
            $table->foreignId('reward_code_id')->nullable()->after('activity_checkin_id')->constrained('reward_codes')->nullOnDelete();
            $table->foreignId('reward_code_redemption_id')->nullable()->after('reward_code_id')->constrained('reward_code_redemptions')->nullOnDelete();
            $table->foreignId('social_mission_id')->nullable()->after('reward_code_redemption_id')->constrained('social_missions')->nullOnDelete();
            $table->foreignId('social_mission_submission_id')->nullable()->after('social_mission_id')->constrained('social_mission_submissions')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sticker_packs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('social_mission_submission_id');
            $table->dropConstrainedForeignId('social_mission_id');
            $table->dropConstrainedForeignId('reward_code_redemption_id');
            $table->dropConstrainedForeignId('reward_code_id');
        });
    }
};
