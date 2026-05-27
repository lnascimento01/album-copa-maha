<?php

namespace Database\Seeders;

use App\Models\Album;
use App\Models\SocialMission;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;

class SocialMissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $team = Team::query()->where('slug', 'maha')->firstOrFail();
        $album = Album::query()->where('slug', 'album-copa-maha-2026')->firstOrFail();

        $master = User::query()->where('email', (string) (env('MASTER_EMAIL') ?: env('ADMIN_EMAIL') ?: 'lfsnascimento84@gmail.com'))->first();
        $status = $album->status === Album::STATUS_ACTIVE ? SocialMission::STATUS_ACTIVE : SocialMission::STATUS_DRAFT;

        $missions = [
            [
                'slug' => 'postar-story-marcando-time',
                'title' => 'Postar story marcando o time',
                'type' => SocialMission::TYPE_INSTAGRAM_STORY,
                'instructions' => 'Poste um story marcando o perfil do time e envie o link ou descreva a postagem para validação.',
                'reward_pack_quantity' => 1,
                'reward_pack_size' => 3,
            ],
            [
                'slug' => 'compartilhar-progresso-do-album',
                'title' => 'Compartilhar progresso do álbum',
                'type' => SocialMission::TYPE_SHARE_ALBUM,
                'instructions' => 'Gere um card de progresso no app, publique nos stories e envie a evidência para validação.',
                'reward_pack_quantity' => 1,
                'reward_pack_size' => 3,
            ],
            [
                'slug' => 'convidar-para-acompanhar-o-time',
                'title' => 'Convidar alguém para acompanhar o time',
                'type' => SocialMission::TYPE_CUSTOM,
                'instructions' => 'Compartilhe uma postagem do time ou convide alguém para seguir o perfil. Descreva a ação realizada.',
                'reward_pack_quantity' => 1,
                'reward_pack_size' => 2,
            ],
        ];

        foreach ($missions as $mission) {
            SocialMission::query()->updateOrCreate(
                ['team_id' => $team->id, 'slug' => $mission['slug']],
                [
                    'album_id' => $album->id,
                    'title' => $mission['title'],
                    'description' => 'Missão social de engajamento da temporada MAHA 2026.',
                    'instructions' => $mission['instructions'],
                    'status' => $status,
                    'type' => $mission['type'],
                    'validation_mode' => SocialMission::VALIDATION_MANUAL,
                    'reward_pack_quantity' => $mission['reward_pack_quantity'],
                    'reward_pack_size' => $mission['reward_pack_size'],
                    'starts_at' => now()->subDay(),
                    'ends_at' => now()->addDays(30),
                    'max_submissions_total' => null,
                    'max_submissions_per_user' => 1,
                    'approved_count' => 0,
                    'created_by' => $master?->id,
                    'updated_by' => $master?->id,
                    'cancelled_by' => null,
                    'cancelled_at' => null,
                    'cancellation_reason' => null,
                ],
            );
        }
    }
}
