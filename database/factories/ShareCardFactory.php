<?php

namespace Database\Factories;

use App\Models\Album;
use App\Models\ShareCard;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShareCard>
 */
class ShareCardFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'album_id' => Album::factory()->active(),
            'type' => ShareCard::TYPE_ALBUM_PROGRESS,
            'title' => 'Meu progresso da temporada',
            'subtitle' => 'Álbum da Copa MAHA',
            'payload' => [
                'type' => ShareCard::TYPE_ALBUM_PROGRESS,
                'user_name' => fake()->name(),
                'album_name' => 'Álbum da Copa MAHA 2026',
                'title' => 'Meu progresso da temporada',
                'subtitle' => 'Álbum da Copa MAHA',
                'metric' => 42,
                'date' => now()->toDateTimeString(),
                'visual_variant' => 'season-card',
            ],
            'created_at' => now(),
        ];
    }
}
