<?php

namespace Database\Seeders;

use App\Models\Album;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;

class AlbumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $team = Team::query()->where('slug', 'maha')->firstOrFail();

        $master = User::query()->where('email', (string) (env('MASTER_EMAIL') ?: env('ADMIN_EMAIL') ?: 'lfsnascimento84@gmail.com'))->first();

        $album = Album::query()->updateOrCreate(
            ['team_id' => $team->id, 'slug' => 'album-copa-maha-2026'],
            [
                'name' => 'Álbum da Copa MAHA 2026',
                'season' => '2026',
                'description' => 'Catálogo inicial do álbum digital da temporada 2026.',
                'status' => Album::STATUS_ACTIVE,
                'published_at' => now(),
                'created_by' => $master?->id,
                'updated_by' => $master?->id,
            ],
        );

        $album->teams()->syncWithoutDetaching([$team->id]);
    }
}
