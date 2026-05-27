<?php

namespace Database\Factories;

use App\Models\RewardCode;
use App\Models\RewardCodeRedemption;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RewardCodeRedemption>
 */
class RewardCodeRedemptionFactory extends Factory
{
    protected $model = RewardCodeRedemption::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reward_code_id' => RewardCode::factory(),
            'user_id' => User::factory(),
            'redeemed_at' => now(),
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit',
            'metadata' => null,
        ];
    }
}
