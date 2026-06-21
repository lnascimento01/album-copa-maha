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
        Schema::create('pool_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_active')->default(false);
            $table->foreignId('album_id')->nullable()->constrained('albums')->nullOnDelete();
            $table->unsignedTinyInteger('exact_score_pack_size')->default(5);
            $table->unsignedTinyInteger('winner_goals_pack_size')->default(3);
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('pool_matches', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('match_number')->unique();
            $table->string('stage');
            $table->string('group_name')->nullable();
            $table->string('home_team');
            $table->string('away_team');
            $table->timestamp('starts_at');
            $table->string('venue')->nullable();
            $table->string('city')->nullable();
            $table->unsignedTinyInteger('home_score')->nullable();
            $table->unsignedTinyInteger('away_score')->nullable();
            $table->foreignId('score_set_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('score_locked_at')->nullable();
            $table->timestamps();

            $table->index('starts_at');
            $table->index('stage');
        });

        Schema::create('pool_predictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('match_id')->constrained('pool_matches')->cascadeOnDelete();
            $table->unsignedTinyInteger('home_score');
            $table->unsignedTinyInteger('away_score');
            $table->boolean('exact_score_rewarded')->default(false);
            $table->boolean('winner_goals_rewarded')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'match_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pool_predictions');
        Schema::dropIfExists('pool_matches');
        Schema::dropIfExists('pool_settings');
    }
};
