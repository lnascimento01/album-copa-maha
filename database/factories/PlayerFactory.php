<?php

namespace Database\Factories;

use App\Models\Player;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Player>
 */
class PlayerFactory extends Factory
{
    protected $model = Player::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'name' => fake()->name(),
            'nickname' => fake()->firstName(),
            'shirt_number' => (string) fake()->numberBetween(1, 30),
            'position' => 'Meia',
            'type' => Player::TYPE_PLAYER,
            'bio' => fake()->sentence(),
            'photo_path' => null,
            'is_active' => true,
            'sort_order' => 0,
        ];
    }
}
