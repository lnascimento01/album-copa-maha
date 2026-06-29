<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pool_matches', function (Blueprint $table) {
            $table->string('penalty_winner')->nullable()->after('away_score');
        });
    }

    public function down(): void
    {
        Schema::table('pool_matches', function (Blueprint $table) {
            $table->dropColumn('penalty_winner');
        });
    }
};
