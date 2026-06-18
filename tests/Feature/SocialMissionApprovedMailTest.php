<?php

use App\Mail\SocialMissionApprovedMail;
use App\Models\Role;
use App\Models\SocialMission;
use App\Models\SocialMissionSubmission;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeMissionMailAdmin(): User
{
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    return $admin;
}

function makeMissionMailParticipant(): User
{
    $user = User::factory()->create();
    $user->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $user;
}

it('queues the social mission approved email to the participant on approval', function (): void {
    Mail::fake();

    $admin = makeMissionMailAdmin();
    $participant = makeMissionMailParticipant();
    $mission = SocialMission::query()->where('status', SocialMission::STATUS_ACTIVE)->firstOrFail();

    $submission = SocialMissionSubmission::factory()->create([
        'social_mission_id' => $mission->id,
        'user_id' => $participant->id,
        'status' => SocialMissionSubmission::STATUS_PENDING,
    ]);

    $this->actingAs($admin)
        ->patch("/admin/social-mission-submissions/{$submission->id}/approve", ['note' => 'ok'])
        ->assertRedirect();

    Mail::assertQueued(
        SocialMissionApprovedMail::class,
        fn (SocialMissionApprovedMail $mail): bool => $mail->hasTo($participant->email)
            && $mail->submission->is($submission),
    );
});

it('does not send the approval email when the submission is rejected', function (): void {
    Mail::fake();

    $admin = makeMissionMailAdmin();
    $participant = makeMissionMailParticipant();
    $mission = SocialMission::query()->where('status', SocialMission::STATUS_ACTIVE)->firstOrFail();

    $submission = SocialMissionSubmission::factory()->create([
        'social_mission_id' => $mission->id,
        'user_id' => $participant->id,
        'status' => SocialMissionSubmission::STATUS_PENDING,
    ]);

    $this->actingAs($admin)
        ->patch("/admin/social-mission-submissions/{$submission->id}/reject", ['rejection_reason' => 'Evidência insuficiente'])
        ->assertRedirect();

    Mail::assertNothingQueued();
});
