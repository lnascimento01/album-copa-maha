<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('social_mission_submissions', function (Blueprint $table) {
            $table->json('evidence_images')->nullable()->after('evidence_url');
        });
    }

    public function down(): void
    {
        Schema::table('social_mission_submissions', function (Blueprint $table) {
            $table->dropColumn('evidence_images');
        });
    }
};
