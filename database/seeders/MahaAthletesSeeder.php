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

        $sortBase = 100;

        $athletes = [
            [
                'name' => 'Pietra', 'position' => 'Ponta', 'shirt_number' => '1',
                'bio' => 'Ponta veloz e técnica. Referência ofensiva da equipe MAHA na temporada 2026.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 1,
                'stickers' => [
                    ['code' => 'MH-001', 'title' => 'PIETRA', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 1],
                    ['code' => 'MH-002', 'title' => 'PIETRA', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 2],
                ],
            ],
            [
                'name' => 'Lucas', 'position' => 'Armador', 'shirt_number' => '3',
                'bio' => 'Armador com grande visão de jogo. Peça-chave na organização ofensiva da MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 3,
                'stickers' => [
                    ['code' => 'MH-003', 'title' => 'LUCAS', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 3],
                    ['code' => 'MH-004', 'title' => 'FONTANA', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 4],
                ],
            ],
            [
                'name' => 'Angélica', 'position' => 'Ala', 'shirt_number' => '5',
                'bio' => 'Ala dinâmica e versátil. Destaque nas transições rápidas e na marcação da equipe MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 5,
                'stickers' => [
                    ['code' => 'MH-005', 'title' => 'ANGÉLICA', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 5],
                    ['code' => 'MH-006', 'title' => 'ANGEL', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 6],
                ],
            ],
            [
                'name' => 'Letícia', 'position' => 'Central', 'shirt_number' => '7',
                'bio' => 'Central determinada com excelente jogo de corpo. Peça fundamental no sistema da MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 7,
                'stickers' => [
                    ['code' => 'MH-007', 'title' => 'LETÍCIA', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 7],
                    ['code' => 'MH-008', 'title' => 'LETÍCIA', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 8],
                ],
            ],
            [
                'name' => 'Tayane', 'position' => 'Ponta', 'shirt_number' => '9',
                'bio' => 'Atleta ágil e versátil na ponta direita da equipe MAHA. Destaque nas jogadas de velocidade.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 9,
                'stickers' => [
                    ['code' => 'MH-009', 'title' => 'TAYANE', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 9],
                    ['code' => 'MH-010', 'title' => 'TAYANE', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 10],
                ],
            ],
            [
                'name' => 'Petra', 'position' => 'Ala', 'shirt_number' => '11',
                'bio' => 'Ala com marcação firme e eficiência nas coberturas defensivas. Presença constante na MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 11,
                'stickers' => [
                    ['code' => 'MH-011', 'title' => 'PETRA', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 11],
                    ['code' => 'MH-012', 'title' => 'PETRA', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 12],
                ],
            ],
            [
                'name' => 'Leonardo', 'position' => 'Pivô', 'shirt_number' => '13',
                'bio' => 'Pivô forte e eficiente na área. Referência no jogo interno da equipe MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 13,
                'stickers' => [
                    ['code' => 'MH-013', 'title' => 'LEONARDO', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 13],
                    ['code' => 'MH-014', 'title' => 'LEONARDO', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 14],
                ],
            ],
            [
                'name' => 'Misael', 'position' => 'Armador', 'shirt_number' => '10',
                'bio' => 'Armador técnico e experiente. Visão de jogo e precisão nas jogadas fazem de Misael um dos destaques da MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 15,
                'stickers' => [
                    ['code' => 'MH-015', 'title' => 'MISAEL', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 15],
                    ['code' => 'MH-016', 'title' => 'MISAEL', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 16],
                ],
            ],
            [
                'name' => 'Pancinha', 'position' => 'Ponta', 'shirt_number' => '17',
                'bio' => 'Ponta veloz e imprevisível. Pancinha é a surpresa da temporada MAHA com suas jogadas criativas.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 17,
                'stickers' => [
                    ['code' => 'MH-017', 'title' => 'PANCINHA', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 17],
                    ['code' => 'MH-018', 'title' => 'PANCINHA', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 18],
                ],
            ],
            [
                'name' => 'Thiago', 'position' => 'Central', 'shirt_number' => '19',
                'bio' => 'Central com liderança em quadra. Thiago organiza o sistema ofensivo da equipe MAHA com precisão.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 19,
                'stickers' => [
                    ['code' => 'MH-019', 'title' => 'THIAGO', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 19],
                    ['code' => 'MH-020', 'title' => 'THIAGO', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 20],
                ],
            ],
            [
                'name' => 'Tarcizo', 'position' => 'Armador', 'shirt_number' => '21',
                'bio' => 'Armador experiente com excelente leitura de jogo. Tarcizo é um dos pilares da MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 21,
                'stickers' => [
                    ['code' => 'MH-021', 'title' => 'TARCIZO', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 21],
                    ['code' => 'MH-022', 'title' => 'TARCIZO', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 22],
                ],
            ],
            [
                'name' => 'Raquel', 'position' => 'Ala', 'shirt_number' => '23',
                'bio' => 'Ala técnica e determinada. Raquel se destaca pelas coberturas inteligentes e dribles precisos na MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 23,
                'stickers' => [
                    ['code' => 'MH-023', 'title' => 'RAQUEL', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 23],
                    ['code' => 'MH-024', 'title' => 'RAQUEL', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 24],
                ],
            ],
            [
                'name' => 'Renato', 'position' => 'Armador', 'shirt_number' => '7',
                'bio' => 'Armador experiente e líder em quadra. Referência técnica e de liderança na equipe MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 25,
                'stickers' => [
                    ['code' => 'MH-025', 'title' => 'RENATO', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 25],
                    ['code' => 'MH-026', 'title' => 'RENATO', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 26],
                ],
            ],
            [
                'name' => 'Leandro', 'position' => 'Pivô', 'shirt_number' => '27',
                'bio' => 'Pivô potente e preciso nas finalizações. Leandro é o referencial ofensivo dentro da área da MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 27,
                'stickers' => [
                    ['code' => 'MH-027', 'title' => 'LEANDRO', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 27],
                    ['code' => 'MH-028', 'title' => 'LEANDRO', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 28],
                ],
            ],
            [
                'name' => 'Mayara', 'position' => 'Ala', 'shirt_number' => '29',
                'bio' => 'Ala versátil com excelente condicionamento. Mayara transita com eficiência nos dois lados da quadra da MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 29,
                'stickers' => [
                    ['code' => 'MH-029', 'title' => 'MAYARA', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 29],
                    ['code' => 'MH-030', 'title' => 'MAY', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 30],
                ],
            ],
            [
                'name' => 'Laysa', 'position' => 'Ponta', 'shirt_number' => '31',
                'bio' => 'Ponta rápida e técnica. Laysa encanta a torcida com suas jogadas individuais na equipe MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 31,
                'stickers' => [
                    ['code' => 'MH-031', 'title' => 'LAYSA', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 31],
                    ['code' => 'MH-032', 'title' => 'LAYSA', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 32],
                ],
            ],
            [
                'name' => 'Bruna', 'position' => 'Central', 'shirt_number' => '33',
                'bio' => 'Central combativa e determinada. Bruna se destaca pela intensidade e entrega em quadra pela MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 33,
                'stickers' => [
                    ['code' => 'MH-033', 'title' => 'BRUNA', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 33],
                    ['code' => 'MH-034', 'title' => 'BRU', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 34],
                ],
            ],
            [
                'name' => 'Jeferson', 'position' => 'Pivô', 'shirt_number' => '36',
                'bio' => 'Pivô de presença física marcante. Jeferson é referência no jogo interno da equipe MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 36,
                'stickers' => [
                    ['code' => 'MH-036', 'title' => 'JEFERSON', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 36],
                ],
            ],
            [
                'name' => 'Apollo', 'position' => 'Armador', 'shirt_number' => '37',
                'bio' => 'Armador habilidoso com passes precisos. Apollo distribui o jogo com tranquilidade pela MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 37,
                'stickers' => [
                    ['code' => 'MH-037', 'title' => 'APOLLO', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 37],
                ],
            ],
            [
                'name' => 'Felipe', 'position' => 'Ala', 'shirt_number' => '38',
                'bio' => 'Ala comprometido com a marcação e transições. Felipe é peça importante no sistema defensivo da MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 38,
                'stickers' => [
                    ['code' => 'MH-038', 'title' => 'FELIPE', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 38],
                ],
            ],
            [
                'name' => 'Keller', 'position' => 'Central', 'shirt_number' => '39',
                'bio' => 'Central com intensidade e garra. Keller impõe seu ritmo nos momentos decisivos da MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 39,
                'stickers' => [
                    ['code' => 'MH-039', 'title' => 'KELLER', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 39],
                ],
            ],
            [
                'name' => 'Valeriano', 'position' => 'Armador', 'shirt_number' => '40',
                'bio' => 'Armador de personalidade forte. Valeriano é liderança natural dentro e fora da quadra da MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 40,
                'stickers' => [
                    ['code' => 'MH-040', 'title' => 'VALERIANO', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 40],
                    ['code' => 'MH-041', 'title' => 'ALEMÃO', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 41],
                ],
            ],
            [
                'name' => 'Carlão', 'position' => 'Pivô', 'shirt_number' => '42',
                'bio' => 'Pivô experiente com jogo de corpo eficiente. Carlão é presença física importante no elenco da MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 42,
                'stickers' => [
                    ['code' => 'MH-042', 'title' => 'CARLÃO', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 42],
                ],
            ],
            [
                'name' => 'Willian', 'position' => 'Ponta', 'shirt_number' => '43',
                'bio' => 'Ponta explosivo com finalização precisa. Willian é um dos artilheiros da equipe MAHA na temporada.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 43,
                'stickers' => [
                    ['code' => 'MH-043', 'title' => 'WILLIAN', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 43],
                    ['code' => 'MH-044', 'title' => 'WILL', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 44],
                ],
            ],
            [
                'name' => 'Caio', 'position' => 'Ala', 'shirt_number' => '45',
                'bio' => 'Ala completo com marcação forte e bom ataque. Caio equilibra as duas fases do jogo pela MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 45,
                'stickers' => [
                    ['code' => 'MH-045', 'title' => 'CAIO', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 45],
                    ['code' => 'MH-046', 'title' => 'CAIO', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 46],
                ],
            ],
            [
                'name' => 'Ingrid', 'position' => 'Ala', 'shirt_number' => '4',
                'bio' => 'Ala com marcação forte e capacidade de transição rápida. Peça fundamental no sistema defensivo da MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 47,
                'stickers' => [
                    ['code' => 'MH-047', 'title' => 'INGRID', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 47],
                    ['code' => 'MH-048', 'title' => 'INGRID', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 48],
                ],
            ],
            [
                'name' => 'Gustavo', 'position' => 'Central', 'shirt_number' => '49',
                'bio' => 'Central com excelente leitura tática. Gustavo é o maestro do meio-campo da equipe MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 49,
                'stickers' => [
                    ['code' => 'MH-049', 'title' => 'GUSTAVO', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 49],
                    ['code' => 'MH-050', 'title' => 'GUS', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 50],
                ],
            ],
            [
                'name' => 'Gabriel', 'position' => 'Central', 'shirt_number' => '10',
                'bio' => 'Central com visão de jogo privilegiada. Destaque nas jogadas de criação e distribuição de bola da equipe MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 53,
                'stickers' => [
                    ['code' => 'MH-053', 'title' => 'GABRIEL', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 53],
                ],
            ],
            [
                'name' => 'Kauanny', 'position' => 'Pivô', 'shirt_number' => '11',
                'bio' => 'Pivô poderosa e determinada. Referência em jogo de corpo e eficiência na área adversária da MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 63,
                'stickers' => [
                    ['code' => 'MH-063', 'title' => 'KAUANNY', 'sticker_type' => Sticker::TYPE_PLAYER, 'rarity' => Sticker::RARITY_COMMON, 'img' => 63],
                ],
            ],
            [
                'name' => 'Pri', 'position' => 'Ala', 'shirt_number' => '5',
                'bio' => 'Ala versátil com excelente condicionamento físico. Presença marcante nos dois lados do campo na equipe MAHA.',
                'player_type' => Player::TYPE_PLAYER, 'photo_img' => 70,
                'stickers' => [
                    ['code' => 'MH-070', 'title' => 'PRI', 'sticker_type' => Sticker::TYPE_SPECIAL, 'rarity' => Sticker::RARITY_EPIC, 'img' => 70],
                ],
            ],
        ];

        foreach ($athletes as $index => $athleteData) {
            $sortOrder = $sortBase + $index;
            $photoPath = sprintf('/stickers/maha/athletes/sticker-%03d.png', $athleteData['photo_img']);

            $player = Player::query()->updateOrCreate(
                ['team_id' => $team->id, 'name' => $athleteData['name']],
                [
                    'position' => $athleteData['position'],
                    'shirt_number' => $athleteData['shirt_number'],
                    'type' => $athleteData['player_type'],
                    'bio' => $athleteData['bio'],
                    'photo_path' => $photoPath,
                    'is_active' => true,
                    'sort_order' => $sortOrder,
                ],
            );

            foreach ($athleteData['stickers'] as $stickerOffset => $stickerData) {
                $imagePath = sprintf('/stickers/maha/athletes/sticker-%03d.png', $stickerData['img']);
                $isSpecial = $stickerData['sticker_type'] === Sticker::TYPE_SPECIAL;

                Sticker::query()->updateOrCreate(
                    ['album_id' => $album->id, 'code' => $stickerData['code']],
                    [
                        'player_id' => $player->id,
                        'title' => $stickerData['title'],
                        'subtitle' => $athleteData['position'],
                        'description' => $athleteData['bio'],
                        'type' => $stickerData['sticker_type'],
                        'rarity' => $stickerData['rarity'],
                        'image_path' => $imagePath,
                        'sort_order' => $sortOrder * 10 + $stickerOffset,
                        'is_active' => true,
                        'metadata' => [
                            'season' => '2026',
                            'catalog_source' => 'drive_stickers',
                            'segment' => $isSpecial ? 'special_player' : 'line_player',
                            'is_special' => $isSpecial,
                        ],
                    ],
                );
            }
        }
    }
}
