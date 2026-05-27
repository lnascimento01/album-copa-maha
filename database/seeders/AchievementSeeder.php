<?php

namespace Database\Seeders;

use App\Models\Achievement;
use App\Models\Album;
use App\Models\Team;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
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

        $seed = [
            [
                'name' => 'Primeira Figurinha',
                'slug' => 'primeira-figurinha',
                'description' => 'Desbloqueou sua primeira figurinha da temporada.',
                'type' => Achievement::TYPE_STICKERS_UNLOCKED,
                'threshold' => 1,
                'sort_order' => 10,
            ],
            [
                'name' => 'Colecionador 10',
                'slug' => 'primeiras-10-figurinhas',
                'description' => 'Desbloqueou 10 figurinhas da temporada.',
                'type' => Achievement::TYPE_STICKERS_UNLOCKED,
                'threshold' => 10,
                'sort_order' => 20,
            ],
            [
                'name' => 'Meio Álbum',
                'slug' => 'metade-do-album',
                'description' => 'Completou 50% do álbum.',
                'type' => Achievement::TYPE_ALBUM_PROGRESS,
                'threshold' => 50,
                'sort_order' => 30,
            ],
            [
                'name' => 'Álbum Completo',
                'slug' => 'album-completo',
                'description' => 'Completou 100% do Álbum da Copa MAHA.',
                'type' => Achievement::TYPE_ALBUM_PROGRESS,
                'threshold' => 100,
                'sort_order' => 40,
            ],
            [
                'name' => 'Pacote Aberto',
                'slug' => 'primeiro-pacote-aberto',
                'description' => 'Abriu o primeiro pacote do Álbum da Copa MAHA.',
                'type' => Achievement::TYPE_PACKS_OPENED,
                'threshold' => 1,
                'sort_order' => 50,
            ],
            [
                'name' => 'Presença Confirmada',
                'slug' => 'presenca-confirmada',
                'description' => 'Confirmou presença em uma atividade do time.',
                'type' => Achievement::TYPE_CHECKINS_CONFIRMED,
                'threshold' => 1,
                'sort_order' => 60,
            ],
            [
                'name' => 'Frequência 5',
                'slug' => 'frequencia-5',
                'description' => 'Confirmou presença em 5 atividades.',
                'type' => Achievement::TYPE_CHECKINS_CONFIRMED,
                'threshold' => 5,
                'sort_order' => 70,
            ],
            [
                'name' => 'Código Resgatado',
                'slug' => 'codigo-resgatado',
                'description' => 'Resgatou um código especial divulgado pelo time.',
                'type' => Achievement::TYPE_REWARD_CODES_REDEEMED,
                'threshold' => 1,
                'sort_order' => 80,
            ],
            [
                'name' => 'Missão Social Aprovada',
                'slug' => 'missao-social-aprovada',
                'description' => 'Completou uma missão social aprovada pela administração.',
                'type' => Achievement::TYPE_SOCIAL_MISSIONS_APPROVED,
                'threshold' => 1,
                'sort_order' => 90,
            ],
            [
                'name' => 'Embaixador MAHA',
                'slug' => 'embaixador-maha',
                'description' => 'Conquista especial concedida manualmente para destaque de engajamento.',
                'type' => Achievement::TYPE_SPECIAL,
                'threshold' => null,
                'sort_order' => 100,
            ],
        ];

        foreach ($seed as $item) {
            Achievement::query()->updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'team_id' => $team->id,
                    'album_id' => $album->id,
                    'name' => $item['name'],
                    'description' => $item['description'],
                    'type' => $item['type'],
                    'threshold' => $item['threshold'],
                    'icon' => 'badge',
                    'color' => '#0f172a',
                    'is_active' => true,
                    'sort_order' => $item['sort_order'],
                ],
            );
        }
    }
}
