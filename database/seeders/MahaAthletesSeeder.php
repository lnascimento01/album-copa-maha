<?php

namespace Database\Seeders;

use App\Models\Album;
use App\Models\Player;
use App\Models\Sticker;
use App\Models\Team;
use Illuminate\Database\Seeder;

class MahaAthletesSeeder extends Seeder
{
    public function run(): void
    {
        $team = Team::query()->where('slug', 'maha')->firstOrFail();
        $album = Album::query()->where('slug', 'album-copa-maha-2026')->firstOrFail();
        $album->teams()->syncWithoutDetaching([$team->id]);

        $sortOrder = 100;

        $createPlayerSticker = function (array $payload) use ($team, $album, &$sortOrder): void {
            $player = Player::query()->updateOrCreate(
                [
                    'team_id' => $team->id,
                    'name' => $payload['name'],
                ],
                [
                    'nickname' => $payload['nickname'] ?? null,
                    'shirt_number' => $payload['shirt_number'] ?? null,
                    'position' => $payload['position'] ?? null,
                    'type' => $payload['player_type'],
                    'bio' => $payload['bio'] ?? null,
                    'photo_path' => $payload['photo_path'] ?? null,
                    'is_active' => true,
                    'sort_order' => $sortOrder,
                ],
            );

            Sticker::query()->updateOrCreate(
                [
                    'album_id' => $album->id,
                    'code' => $payload['code'],
                ],
                [
                    'player_id' => $player->id,
                    'title' => $payload['name'],
                    'subtitle' => $payload['position'] ?? null,
                    'description' => $payload['description'] ?? $payload['bio'] ?? null,
                    'type' => $payload['sticker_type'],
                    'rarity' => $payload['rarity'],
                    'image_path' => $payload['image_path'] ?? null,
                    'sort_order' => $sortOrder,
                    'is_active' => true,
                    'metadata' => [
                        'season' => '2026',
                        'catalog_source' => 'drive_stickers',
                        'segment' => $payload['segment'] ?? 'line_player',
                        'is_special' => $payload['is_special'] ?? false,
                    ],
                ],
            );

            $sortOrder++;
        };

        $athletes = [
            // TAYANE — normal (#9) + RARA (#10)
            [
                'name' => 'Tayane',
                'position' => 'Ponta',
                'shirt_number' => '9',
                'bio' => 'Atleta ágil e versátil na ponta direita da equipe MAHA. Destaque nas jogadas de velocidade e finalizações precisas.',
                'player_type' => Player::TYPE_PLAYER,
                'code' => 'MH-009',
                'sticker_type' => Sticker::TYPE_PLAYER,
                'rarity' => Sticker::RARITY_COMMON,
                'photo_path' => '/stickers/maha/athletes/tayane.png',
                'image_path' => '/stickers/maha/athletes/tayane.png',
                'is_special' => false,
            ],
            [
                'name' => 'Tayane',
                'position' => 'Ponta',
                'shirt_number' => '9',
                'bio' => 'Atleta ágil e versátil na ponta direita da equipe MAHA. Destaque nas jogadas de velocidade e finalizações precisas.',
                'player_type' => Player::TYPE_PLAYER,
                'code' => 'MH-010',
                'sticker_type' => Sticker::TYPE_SPECIAL,
                'rarity' => Sticker::RARITY_EPIC,
                'photo_path' => '/stickers/maha/athletes/tayane.png',
                'image_path' => '/stickers/maha/athletes/tayane-rara.png',
                'segment' => 'special_player',
                'is_special' => true,
            ],

            // RENATO — normal (#25) + RARA (#26)
            [
                'name' => 'Renato',
                'position' => 'Armador',
                'shirt_number' => '7',
                'bio' => 'Armador experiente e líder em quadra. Referência técnica e de liderança na equipe MAHA.',
                'player_type' => Player::TYPE_PLAYER,
                'code' => 'MH-025',
                'sticker_type' => Sticker::TYPE_PLAYER,
                'rarity' => Sticker::RARITY_COMMON,
                'photo_path' => '/stickers/maha/athletes/renato.png',
                'image_path' => '/stickers/maha/athletes/renato.png',
                'is_special' => false,
            ],
            [
                'name' => 'Renato',
                'position' => 'Armador',
                'shirt_number' => '7',
                'bio' => 'Armador experiente e líder em quadra. Referência técnica e de liderança na equipe MAHA.',
                'player_type' => Player::TYPE_PLAYER,
                'code' => 'MH-026',
                'sticker_type' => Sticker::TYPE_SPECIAL,
                'rarity' => Sticker::RARITY_EPIC,
                'photo_path' => '/stickers/maha/athletes/renato.png',
                'image_path' => '/stickers/maha/athletes/renato-rara.png',
                'segment' => 'special_player',
                'is_special' => true,
            ],

            // INGRID — normal (#47)
            [
                'name' => 'Ingrid',
                'position' => 'Ala',
                'shirt_number' => '4',
                'bio' => 'Ala com marcação forte e capacidade de transição rápida. Peça fundamental no sistema defensivo da MAHA.',
                'player_type' => Player::TYPE_PLAYER,
                'code' => 'MH-047',
                'sticker_type' => Sticker::TYPE_PLAYER,
                'rarity' => Sticker::RARITY_COMMON,
                'photo_path' => '/stickers/maha/athletes/ingrid.png',
                'image_path' => '/stickers/maha/athletes/ingrid.png',
                'is_special' => false,
            ],

            // GABRIEL — normal (#53)
            [
                'name' => 'Gabriel',
                'position' => 'Central',
                'shirt_number' => '10',
                'bio' => 'Central com visão de jogo privilegiada. Destaque nas jogadas de criação e distribuição de bola da equipe MAHA.',
                'player_type' => Player::TYPE_PLAYER,
                'code' => 'MH-053',
                'sticker_type' => Sticker::TYPE_PLAYER,
                'rarity' => Sticker::RARITY_COMMON,
                'photo_path' => '/stickers/maha/athletes/gabriel.png',
                'image_path' => '/stickers/maha/athletes/gabriel.png',
                'is_special' => false,
            ],

            // KAUANNY — normal (#63)
            [
                'name' => 'Kauanny',
                'position' => 'Pivô',
                'shirt_number' => '11',
                'bio' => 'Pivô poderosa e determinada. Referência em jogo de corpo e eficiência na área adversária da MAHA.',
                'player_type' => Player::TYPE_PLAYER,
                'code' => 'MH-063',
                'sticker_type' => Sticker::TYPE_PLAYER,
                'rarity' => Sticker::RARITY_COMMON,
                'photo_path' => '/stickers/maha/athletes/kauanny.png',
                'image_path' => '/stickers/maha/athletes/kauanny.png',
                'is_special' => false,
            ],

            // MISAEL — RARA (#16)
            [
                'name' => 'Misael',
                'position' => 'Armador',
                'shirt_number' => '10',
                'bio' => 'Armador técnico e experiente. Visão de jogo e precisão nas jogadas fazem de Misael um dos destaques da equipe MAHA.',
                'player_type' => Player::TYPE_PLAYER,
                'code' => 'MH-016',
                'sticker_type' => Sticker::TYPE_SPECIAL,
                'rarity' => Sticker::RARITY_EPIC,
                'photo_path' => '/stickers/maha/athletes/misael-rara.png',
                'image_path' => '/stickers/maha/athletes/misael-rara.png',
                'segment' => 'special_player',
                'is_special' => true,
            ],

            // PRI — RARA (#70)
            [
                'name' => 'Pri',
                'position' => 'Ala',
                'shirt_number' => '5',
                'bio' => 'Ala versátil com excelente condicionamento físico. Presença marcante nos dois lados do campo na equipe MAHA.',
                'player_type' => Player::TYPE_PLAYER,
                'code' => 'MH-070',
                'sticker_type' => Sticker::TYPE_SPECIAL,
                'rarity' => Sticker::RARITY_EPIC,
                'photo_path' => '/stickers/maha/athletes/pri-rara.png',
                'image_path' => '/stickers/maha/athletes/pri-rara.png',
                'segment' => 'special_player',
                'is_special' => true,
            ],
        ];

        foreach ($athletes as $athlete) {
            $createPlayerSticker($athlete);
        }
    }
}
