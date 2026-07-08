<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reward_codes', function (Blueprint $table) {
            $table->foreignId('activity_id')->nullable()->after('team_id')->constrained('activities')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('reward_codes', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\Activity::class);
            $table->dropColumn('activity_id');
        });
    }
};
