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
        Schema::table('activity_checkins', function (Blueprint $table) {
            $table->decimal('latitude', 10, 7)->nullable()->after('notes');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->unsignedInteger('accuracy_meters')->nullable()->after('longitude');
            $table->unsignedInteger('distance_meters')->nullable()->after('accuracy_meters');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activity_checkins', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude', 'accuracy_meters', 'distance_meters']);
        });
    }
};
