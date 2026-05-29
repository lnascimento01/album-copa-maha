<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\Album;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Activity>
 */
class ActivityFactory extends Factory
{
    protected $model = Activity::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = 'Atividade '.fake()->unique()->numerify('###');

        return [
            'team_id' => Team::factory(),
            'album_id' => Album::factory()->active(),
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numerify('###'),
            'type' => Activity::TYPE_TRAINING,
            'status' => Activity::STATUS_DRAFT,
            'description' => fake()->sentence(),
            'location_name' => null,
            'latitude' => null,
            'longitude' => null,
            'radius_meters' => 150,
            'max_accuracy_meters' => 100,
            'event_timezone' => 'America/Sao_Paulo',
            'event_token' => null,
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDay()->addHour(),
            'reward_pack_quantity' => 1,
            'reward_pack_size' => 3,
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
            'opened_at' => null,
            'closed_at' => null,
            'cancelled_at' => null,
            'cancellation_reason' => null,
            'metadata' => null,
        ];
    }

    public function open(): static
    {
        return $this->state(fn () => [
            'status' => Activity::STATUS_OPEN,
            'opened_at' => now(),
            'closed_at' => null,
            'cancelled_at' => null,
            'cancellation_reason' => null,
        ]);
    }

    public function closed(): static
    {
        return $this->state(fn () => [
            'status' => Activity::STATUS_CLOSED,
            'opened_at' => now()->subHour(),
            'closed_at' => now(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => [
            'status' => Activity::STATUS_CANCELLED,
            'cancelled_at' => now(),
            'cancellation_reason' => 'cancelled by tests',
        ]);
    }
}
