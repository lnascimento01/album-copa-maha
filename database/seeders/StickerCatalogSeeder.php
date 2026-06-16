<?php

namespace Database\Seeders;

use App\Models\Album;
use App\Models\Sticker;
use Illuminate\Database\Seeder;

class StickerCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $album = Album::query()->where('slug', 'album-copa-maha-2026')->firstOrFail();

        $catalogStickers = [
            [
                'code' => 'MH-T01',
                'title' => 'EQUIPE MAHA',
                'subtitle' => 'Temporada 2026',
                'description' => 'Figurinha oficial da equipe MAHA na temporada 2026.',
                'type' => Sticker::TYPE_TEAM,
                'rarity' => Sticker::RARITY_RARE,
                'image_path' => '/stickers/maha/catalog/sticker-team.png',
                'sort_order' => 1,
            ],
            [
                'code' => 'MH-M01',
                'title' => 'GRANDE FINAL',
                'subtitle' => 'Copa MAHA 2026',
                'description' => 'O momento mais emocionante da Copa MAHA 2026.',
                'type' => Sticker::TYPE_MOMENT,
                'rarity' => Sticker::RARITY_RARE,
                'image_path' => '/stickers/maha/catalog/sticker-final.png',
                'sort_order' => 2,
            ],
            [
                'code' => 'MH-M02',
                'title' => 'CAMPEÃO',
                'subtitle' => 'Copa MAHA 2026',
                'description' => 'A conquista histórica da Copa MAHA 2026.',
                'type' => Sticker::TYPE_MOMENT,
                'rarity' => Sticker::RARITY_LEGENDARY,
                'image_path' => '/stickers/maha/catalog/sticker-champion.png',
                'sort_order' => 3,
            ],
        ];

        foreach ($catalogStickers as $data) {
            Sticker::query()->updateOrCreate(
                ['album_id' => $album->id, 'code' => $data['code']],
                [
                    'player_id' => null,
                    'title' => $data['title'],
                    'subtitle' => $data['subtitle'],
                    'description' => $data['description'],
                    'type' => $data['type'],
                    'rarity' => $data['rarity'],
                    'image_path' => $data['image_path'],
                    'sort_order' => $data['sort_order'],
                    'is_active' => true,
                    'metadata' => [
                        'season' => '2026',
                        'catalog_source' => 'catalog',
                    ],
                ],
            );
        }
    }
}
