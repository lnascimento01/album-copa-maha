<?php

namespace Database\Factories;

use App\Models\Album;
use App\Models\StickerPack;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StickerPack>
 */
class StickerPackFactory extends Factory
{
    protected $model = StickerPack::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'album_id' => Album::factory()->active(),
            'activity_id' => null,
            'activity_checkin_id' => null,
            'reward_code_id' => null,
            'reward_code_redemption_id' => null,
            'social_mission_id' => null,
            'social_mission_submission_id' => null,
            'granted_by' => null,
            'source' => StickerPack::SOURCE_ADMIN,
            'status' => StickerPack::STATUS_PENDING,
            'size' => 3,
            'opened_at' => null,
            'cancelled_at' => null,
            'cancellation_reason' => null,
            'metadata' => null,
        ];
    }

    public function opened(): static
    {
        return $this->state(fn () => [
            'status' => StickerPack::STATUS_OPENED,
            'opened_at' => now(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => [
            'status' => StickerPack::STATUS_CANCELLED,
            'cancelled_at' => now(),
            'cancellation_reason' => 'cancelled by tests',
        ]);
    }
}
