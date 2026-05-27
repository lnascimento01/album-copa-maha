<?php

namespace Database\Factories;

use App\Models\Achievement;
use App\Models\Album;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Achievement>
 */
class AchievementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = 'Conquista '.fake()->unique()->numerify('###');

        return [
            'team_id' => Team::factory(),
            'album_id' => Album::factory()->active(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numerify('###'),
            'description' => fake()->sentence(),
            'type' => Achievement::TYPE_STICKERS_UNLOCKED,
            'threshold' => 1,
            'icon' => 'medal',
            'color' => '#1D4ED8',
            'is_active' => true,
            'sort_order' => 0,
            'metadata' => null,
        ];
    }
}
