<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\ActivityCheckin;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ActivityCheckin>
 */
class ActivityCheckinFactory extends Factory
{
    protected $model = ActivityCheckin::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'activity_id' => Activity::factory()->open(),
            'user_id' => User::factory(),
            'checked_by' => User::factory(),
            'status' => ActivityCheckin::STATUS_CONFIRMED,
            'checked_at' => now(),
            'revoked_at' => null,
            'revoked_by' => null,
            'revoke_reason' => null,
            'notes' => null,
            'metadata' => null,
        ];
    }

    public function revoked(): static
    {
        return $this->state(fn () => [
            'status' => ActivityCheckin::STATUS_REVOKED,
            'revoked_at' => now(),
            'revoke_reason' => 'revoked by tests',
        ]);
    }
}
