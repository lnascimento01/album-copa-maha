<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('album_team', function (Blueprint $table) {
            $table->id();
            $table->foreignId('album_id')->constrained('albums')->cascadeOnDelete();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['album_id', 'team_id']);
        });

        DB::table('albums')
            ->select(['id', 'team_id'])
            ->whereNotNull('team_id')
            ->orderBy('id')
            ->chunk(200, function ($albums): void {
                $rows = [];
                $now = now();

                foreach ($albums as $album) {
                    $rows[] = [
                        'album_id' => $album->id,
                        'team_id' => $album->team_id,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                if ($rows !== []) {
                    DB::table('album_team')->insertOrIgnore($rows);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('album_team');
    }
};
