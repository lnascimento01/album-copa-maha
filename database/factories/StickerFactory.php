<?php

namespace Database\Factories;

use App\Models\Album;
use App\Models\Player;
use App\Models\Sticker;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sticker>
 */
class StickerFactory extends Factory
{
    protected $model = Sticker::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'album_id' => Album::factory(),
            'player_id' => null,
            'code' => 'TST-'.fake()->unique()->numerify('###'),
            'title' => 'Sticker '.fake()->unique()->numerify('###'),
            'subtitle' => null,
            'description' => fake()->sentence(),
            'type' => Sticker::TYPE_PLAYER,
            'rarity' => Sticker::RARITY_COMMON,
            'image_path' => null,
            'sort_order' => 0,
            'is_active' => true,
            'metadata' => null,
        ];
    }

    public function forPlayer(Player $player): static
    {
        return $this->state(fn () => [
            'player_id' => $player->id,
        ]);
    }
}
