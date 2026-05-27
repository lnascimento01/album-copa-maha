<?php

namespace Database\Factories;

use App\Models\Achievement;
use App\Models\Album;
use App\Models\User;
use App\Models\UserAchievement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserAchievement>
 */
class UserAchievementFactory extends Factory
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
            'achievement_id' => Achievement::factory(),
            'album_id' => Album::factory()->active(),
            'unlocked_at' => now(),
            'source' => UserAchievement::SOURCE_EVALUATOR,
            'metadata' => null,
        ];
    }
}
