<?php

namespace Database\Seeders;

use App\Models\Album;
use App\Models\RewardCode;
use App\Models\User;
use Illuminate\Database\Seeder;

class RewardCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $album = Album::query()->where('slug', 'album-copa-maha-2026')->firstOrFail();

        $master = User::query()->where('email', (string) (env('MASTER_EMAIL') ?: env('ADMIN_EMAIL') ?: 'lfsnascimento84@gmail.com'))->first();
        $status = $album->status === Album::STATUS_ACTIVE ? RewardCode::STATUS_ACTIVE : RewardCode::STATUS_DRAFT;

        $codes = [
            [
                'code' => 'MAHA10',
                'title' => 'Código de boas-vindas',
                'description' => 'Código inicial para entrada na temporada do Álbum da Copa MAHA.',
                'source_channel' => RewardCode::CHANNEL_INSTAGRAM,
                'reward_pack_quantity' => 1,
                'reward_pack_size' => 3,
                'max_redemptions_per_user' => 1,
            ],
            [
                'code' => 'TREINOFORTE',
                'title' => 'Código de treino da semana',
                'description' => 'Código divulgado nos stories de treino da equipe.',
                'source_channel' => RewardCode::CHANNEL_INSTAGRAM,
                'reward_pack_quantity' => 1,
                'reward_pack_size' => 3,
                'max_redemptions_per_user' => 1,
            ],
            [
                'code' => 'RESENHAMAHA',
                'title' => 'Código de evento e resenha',
                'description' => 'Código especial de ativação para eventos presenciais do time.',
                'source_channel' => RewardCode::CHANNEL_EVENT,
                'reward_pack_quantity' => 1,
                'reward_pack_size' => 2,
                'max_redemptions_per_user' => 1,
            ],
        ];

        foreach ($codes as $item) {
            RewardCode::query()->updateOrCreate(
                ['code' => $item['code']],
                [
                    'team_id' => $album->team_id,
                    'album_id' => $album->id,
                    'title' => $item['title'],
                    'description' => $item['description'],
                    'status' => $status,
                    'source_channel' => $item['source_channel'],
                    'reward_pack_quantity' => $item['reward_pack_quantity'],
                    'reward_pack_size' => $item['reward_pack_size'],
                    'starts_at' => now()->subDay(),
                    'expires_at' => now()->addDays(45),
                    'max_total_redemptions' => null,
                    'max_redemptions_per_user' => $item['max_redemptions_per_user'],
                    'redeemed_count' => 0,
                    'created_by' => $master?->id,
                    'revoked_by' => null,
                    'revoked_at' => null,
                    'revoke_reason' => null,
                ],
            );
        }
    }
}
