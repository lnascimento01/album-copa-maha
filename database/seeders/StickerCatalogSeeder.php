<?php

namespace Database\Seeders;

use App\Models\Album;
use App\Models\Player;
use App\Models\Sticker;
use App\Models\Team;
use Illuminate\Database\Seeder;

class StickerCatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $team = Team::query()->where('slug', 'maha')->firstOrFail();
        $album = Album::query()->where('team_id', $team->id)->where('slug', 'album-copa-maha-2026')->firstOrFail();

        $sortOrder = 1;

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
                    'photo_path' => null,
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
                    'title' => $payload['title'] ?? $payload['name'],
                    'subtitle' => $payload['subtitle'] ?? $payload['position'] ?? null,
                    'description' => $payload['description'],
                    'type' => $payload['sticker_type'],
                    'rarity' => $payload['rarity'],
                    'image_path' => null,
                    'sort_order' => $sortOrder,
                    'is_active' => true,
                    'metadata' => [
                        'season' => '2026',
                        'catalog_source' => 'stage9_demo',
                        'segment' => $payload['segment'] ?? 'base',
                    ],
                ],
            );

            $sortOrder++;
        };

        $createDirectSticker = function (array $payload) use ($album, &$sortOrder): void {
            Sticker::query()->updateOrCreate(
                [
                    'album_id' => $album->id,
                    'code' => $payload['code'],
                ],
                [
                    'player_id' => null,
                    'title' => $payload['title'],
                    'subtitle' => $payload['subtitle'] ?? null,
                    'description' => $payload['description'],
                    'type' => $payload['sticker_type'],
                    'rarity' => $payload['rarity'],
                    'image_path' => null,
                    'sort_order' => $sortOrder,
                    'is_active' => true,
                    'metadata' => [
                        'season' => '2026',
                        'catalog_source' => 'stage9_demo',
                        'segment' => $payload['segment'] ?? 'special',
                    ],
                ],
            );

            $sortOrder++;
        };

        $linePlayers = [
            ['name' => 'Atleta MAHA 01', 'position' => 'Armador', 'shirt_number' => '2'],
            ['name' => 'Atleta MAHA 02', 'position' => 'Ponta', 'shirt_number' => '3'],
            ['name' => 'Atleta MAHA 03', 'position' => 'Pivô', 'shirt_number' => '4'],
            ['name' => 'Atleta MAHA 04', 'position' => 'Central', 'shirt_number' => '5'],
            ['name' => 'Atleta MAHA 05', 'position' => 'Ala', 'shirt_number' => '6'],
            ['name' => 'Atleta MAHA 06', 'position' => 'Ponta', 'shirt_number' => '7'],
            ['name' => 'Atleta MAHA 07', 'position' => 'Armador', 'shirt_number' => '8'],
            ['name' => 'Atleta MAHA 08', 'position' => 'Pivô', 'shirt_number' => '9'],
            ['name' => 'Atleta MAHA 09', 'position' => 'Central', 'shirt_number' => '10'],
            ['name' => 'Atleta MAHA 10', 'position' => 'Ala', 'shirt_number' => '11'],
            ['name' => 'Atleta MAHA 11', 'position' => 'Ponta', 'shirt_number' => '12'],
            ['name' => 'Atleta MAHA 12', 'position' => 'Armador', 'shirt_number' => '13'],
            ['name' => 'Atleta MAHA 13', 'position' => 'Pivô', 'shirt_number' => '14'],
            ['name' => 'Atleta MAHA 14', 'position' => 'Central', 'shirt_number' => '15'],
        ];

        foreach ($linePlayers as $index => $item) {
            $createPlayerSticker([
                ...$item,
                'code' => sprintf('MAHA-%03d', $index + 1),
                'player_type' => Player::TYPE_PLAYER,
                'sticker_type' => Sticker::TYPE_PLAYER,
                'rarity' => Sticker::RARITY_COMMON,
                'description' => 'Atleta da rotação principal da temporada MAHA 2026.',
                'segment' => 'line_player',
            ]);
        }

        $goalkeepers = [
            ['name' => 'Goleiro MAHA 01', 'shirt_number' => '1'],
            ['name' => 'Goleiro MAHA 02', 'shirt_number' => '16'],
        ];

        foreach ($goalkeepers as $index => $item) {
            $createPlayerSticker([
                ...$item,
                'position' => 'Goleiro',
                'code' => sprintf('GK-%03d', $index + 1),
                'player_type' => Player::TYPE_GOALKEEPER,
                'sticker_type' => Sticker::TYPE_GOALKEEPER,
                'rarity' => Sticker::RARITY_RARE,
                'description' => 'Especialista de defesa da temporada MAHA 2026.',
                'segment' => 'goalkeeper',
            ]);
        }

        $staff = [
            [
                'name' => 'Comissao Tecnica MAHA',
                'position' => 'Preparação',
                'code' => 'STF-001',
                'player_type' => Player::TYPE_STAFF,
                'sticker_type' => Sticker::TYPE_STAFF,
                'rarity' => Sticker::RARITY_RARE,
                'description' => 'Equipe de apoio responsável pela preparação da temporada.',
            ],
            [
                'name' => 'Tecnico MAHA',
                'position' => 'Comando técnico',
                'code' => 'COA-001',
                'player_type' => Player::TYPE_COACH,
                'sticker_type' => Sticker::TYPE_COACH,
                'rarity' => Sticker::RARITY_RARE,
                'description' => 'Comando técnico principal do ciclo 2026.',
            ],
        ];

        foreach ($staff as $item) {
            $createPlayerSticker([
                ...$item,
                'shirt_number' => null,
                'segment' => 'staff',
            ]);
        }

        $createDirectSticker([
            'code' => 'TEAM-001',
            'title' => 'Time MAHA 2026',
            'subtitle' => 'Elenco da temporada',
            'description' => 'Card institucional da equipe MAHA para a temporada 2026.',
            'sticker_type' => Sticker::TYPE_TEAM,
            'rarity' => Sticker::RARITY_LEGENDARY,
            'segment' => 'team_card',
        ]);

        for ($moment = 1; $moment <= 6; $moment++) {
            $momentName = sprintf('Momento da Temporada %02d', $moment);

            $createPlayerSticker([
                'name' => $momentName,
                'position' => 'Momento especial',
                'shirt_number' => null,
                'code' => sprintf('MOM-%03d', $moment),
                'player_type' => Player::TYPE_MOMENT_SUBJECT,
                'sticker_type' => Sticker::TYPE_MOMENT,
                'rarity' => Sticker::RARITY_RARE,
                'description' => 'Registro de momento marcante da temporada MAHA 2026.',
                'segment' => 'moment',
            ]);
        }

        $specialCards = [
            [
                'code' => 'SPC-001',
                'title' => 'Destaque Ofensivo MAHA',
                'subtitle' => 'Fase decisiva',
                'description' => 'Card especial do destaque ofensivo da temporada.',
                'sticker_type' => Sticker::TYPE_SPECIAL,
                'rarity' => Sticker::RARITY_EPIC,
            ],
            [
                'code' => 'SPC-002',
                'title' => 'Muralha MAHA',
                'subtitle' => 'Sequência defensiva',
                'description' => 'Card especial das melhores atuações defensivas do time.',
                'sticker_type' => Sticker::TYPE_SPECIAL,
                'rarity' => Sticker::RARITY_EPIC,
            ],
            [
                'code' => 'SPC-003',
                'title' => 'Capitão MAHA',
                'subtitle' => 'Liderança em quadra',
                'description' => 'Card especial de liderança e presença competitiva.',
                'sticker_type' => Sticker::TYPE_SPECIAL,
                'rarity' => Sticker::RARITY_EPIC,
            ],
            [
                'code' => 'LEG-001',
                'title' => 'Historia MAHA',
                'subtitle' => 'Presença, coleção e time',
                'description' => 'Card lendário que celebra a trajetória da equipe na temporada.',
                'sticker_type' => Sticker::TYPE_LEGEND,
                'rarity' => Sticker::RARITY_LEGENDARY,
            ],
        ];

        foreach ($specialCards as $card) {
            $createDirectSticker([
                ...$card,
                'segment' => 'special',
            ]);
        }
    }
}
