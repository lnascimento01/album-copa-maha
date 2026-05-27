<?php

namespace Database\Factories;

use App\Models\SocialMission;
use App\Models\SocialMissionSubmission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SocialMissionSubmission>
 */
class SocialMissionSubmissionFactory extends Factory
{
    protected $model = SocialMissionSubmission::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'social_mission_id' => SocialMission::factory(),
            'user_id' => User::factory(),
            'status' => SocialMissionSubmission::STATUS_PENDING,
            'evidence_text' => fake()->sentence(),
            'evidence_url' => fake()->url(),
            'submitted_at' => now(),
            'reviewed_by' => null,
            'reviewed_at' => null,
            'rejection_reason' => null,
            'metadata' => null,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn () => [
            'status' => SocialMissionSubmission::STATUS_APPROVED,
            'reviewed_by' => User::factory(),
            'reviewed_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn () => [
            'status' => SocialMissionSubmission::STATUS_REJECTED,
            'reviewed_by' => User::factory(),
            'reviewed_at' => now(),
            'rejection_reason' => 'rejected by tests',
        ]);
    }
}
