<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Album;
use App\Models\Team;
use Illuminate\Database\Seeder;

class ActivitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $team = Team::query()->where('slug', 'maha')->first();
        $album = Album::query()->where('status', Album::STATUS_ACTIVE)->first();

        if (! $team || ! $album) {
            return;
        }

        Activity::query()->updateOrCreate(
            [
                'team_id' => $team->id,
                'slug' => 'treino-maha-presenca-inicial',
            ],
            [
                'album_id' => $album->id,
                'title' => 'Treino MAHA — Presença Inicial',
                'type' => Activity::TYPE_TRAINING,
                'status' => Activity::STATUS_OPEN,
                'description' => 'Atividade operacional inicial para validar check-in e concessão automática de pacotes.',
                'starts_at' => now()->subHour(),
                'ends_at' => now()->addHour(),
                'reward_pack_quantity' => 1,
                'reward_pack_size' => 3,
                'opened_at' => now(),
                'closed_at' => null,
                'cancelled_at' => null,
                'cancellation_reason' => null,
                'metadata' => [
                    'seeded' => true,
                ],
            ],
        );
    }
}
