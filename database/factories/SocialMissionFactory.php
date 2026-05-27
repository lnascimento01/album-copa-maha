<?php

namespace Database\Factories;

use App\Models\Album;
use App\Models\SocialMission;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<SocialMission>
 */
class SocialMissionFactory extends Factory
{
    protected $model = SocialMission::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = 'Missão '.fake()->unique()->numerify('###');

        return [
            'team_id' => Team::factory(),
            'album_id' => Album::factory()->active(),
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numerify('###'),
            'description' => fake()->sentence(),
            'instructions' => fake()->paragraph(),
            'status' => SocialMission::STATUS_DRAFT,
            'type' => SocialMission::TYPE_INSTAGRAM_STORY,
            'validation_mode' => SocialMission::VALIDATION_MANUAL,
            'reward_pack_quantity' => 1,
            'reward_pack_size' => 3,
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addDays(2),
            'max_submissions_total' => null,
            'max_submissions_per_user' => 1,
            'approved_count' => 0,
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
            'cancelled_by' => null,
            'cancelled_at' => null,
            'cancellation_reason' => null,
            'metadata' => null,
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => [
            'status' => SocialMission::STATUS_ACTIVE,
            'starts_at' => now()->subHour(),
            'ends_at' => now()->addDay(),
        ]);
    }

    public function closed(): static
    {
        return $this->state(fn () => [
            'status' => SocialMission::STATUS_CLOSED,
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => [
            'status' => SocialMission::STATUS_CANCELLED,
            'cancelled_at' => now(),
            'cancellation_reason' => 'cancelled by tests',
        ]);
    }
}
