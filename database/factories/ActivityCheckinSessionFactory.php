<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\ActivityCheckinSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ActivityCheckinSession>
 */
class ActivityCheckinSessionFactory extends Factory
{
    protected $model = ActivityCheckinSession::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'activity_id' => Activity::factory()->open(),
            'token_hash' => hash('sha256', Str::random(80)),
            'public_code' => 'MAHA-'.strtoupper(Str::random(5)),
            'status' => ActivityCheckinSession::STATUS_ACTIVE,
            'starts_at' => null,
            'expires_at' => now()->addMinutes(15),
            'max_uses' => null,
            'used_count' => 0,
            'created_by' => User::factory(),
            'revoked_by' => null,
            'revoked_at' => null,
            'revoke_reason' => null,
            'metadata' => null,
        ];
    }

    public function expired(): static
    {
        return $this->state(fn () => [
            'status' => ActivityCheckinSession::STATUS_EXPIRED,
            'expires_at' => now()->subMinute(),
        ]);
    }

    public function revoked(): static
    {
        return $this->state(fn () => [
            'status' => ActivityCheckinSession::STATUS_REVOKED,
            'revoked_at' => now(),
            'revoke_reason' => 'revoked by tests',
        ]);
    }
}
