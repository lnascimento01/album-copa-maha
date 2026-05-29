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
        Schema::table('activities', function (Blueprint $table) {
            $table->string('location_name')->nullable()->after('description');
            $table->decimal('latitude', 10, 7)->nullable()->after('location_name');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->unsignedInteger('radius_meters')->default(150)->after('longitude');
            $table->unsignedInteger('max_accuracy_meters')->default(100)->after('radius_meters');
            $table->string('event_timezone', 64)->default('America/Sao_Paulo')->after('max_accuracy_meters');
            $table->string('event_token')->nullable()->after('event_timezone');

            $table->unique('event_token');
            $table->index(['type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->dropIndex(['type', 'status']);
            $table->dropUnique(['event_token']);
            $table->dropColumn([
                'location_name',
                'latitude',
                'longitude',
                'radius_meters',
                'max_accuracy_meters',
                'event_timezone',
                'event_token',
            ]);
        });
    }
};
