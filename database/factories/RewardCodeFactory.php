<?php

namespace Database\Factories;

use App\Models\Album;
use App\Models\RewardCode;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RewardCode>
 */
class RewardCodeFactory extends Factory
{
    protected $model = RewardCode::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $code = 'CODE-'.fake()->unique()->numerify('####');

        return [
            'album_id' => Album::factory()->active(),
            'team_id' => Team::factory(),
            'code' => $code,
            'title' => 'Código '.$code,
            'description' => fake()->sentence(),
            'status' => RewardCode::STATUS_DRAFT,
            'source_channel' => RewardCode::CHANNEL_INSTAGRAM,
            'reward_pack_quantity' => 1,
            'reward_pack_size' => 3,
            'starts_at' => now()->subHour(),
            'expires_at' => now()->addDay(),
            'max_total_redemptions' => null,
            'max_redemptions_per_user' => 1,
            'redeemed_count' => 0,
            'created_by' => User::factory(),
            'revoked_by' => null,
            'revoked_at' => null,
            'revoke_reason' => null,
            'metadata' => null,
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => [
            'status' => RewardCode::STATUS_ACTIVE,
            'starts_at' => now()->subHour(),
            'expires_at' => now()->addDay(),
        ]);
    }

    public function revoked(): static
    {
        return $this->state(fn () => [
            'status' => RewardCode::STATUS_REVOKED,
            'revoked_at' => now(),
            'revoke_reason' => 'revoked by tests',
        ]);
    }
}
