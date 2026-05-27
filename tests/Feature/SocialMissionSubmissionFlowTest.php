<?php

use App\Models\Album;
use App\Models\Role;
use App\Models\SocialMission;
use App\Models\SocialMissionSubmission;
use App\Models\StickerPack;
use App\Models\Team;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeMissionAdmin(): User
{
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    return $admin;
}

function makeMissionParticipant(): User
{
    $user = User::factory()->create();
    $user->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $user;
}

it('participant sees active missions and submits pending entry with audit', function (): void {
    $participant = makeMissionParticipant();
    $mission = SocialMission::query()->where('status', SocialMission::STATUS_ACTIVE)->firstOrFail();

    $this->actingAs($participant)->get('/social-missions')->assertOk();

    $this->actingAs($participant)->post("/social-missions/{$mission->id}/submissions", [
        'evidence_text' => 'Postado no story com marcação do time.',
        'evidence_url' => 'https://instagram.com/story/example',
    ])->assertRedirect();

    $submission = SocialMissionSubmission::query()
        ->where('social_mission_id', $mission->id)
        ->where('user_id', $participant->id)
        ->firstOrFail();

    expect($submission->status)->toBe(SocialMissionSubmission::STATUS_PENDING);

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'social_mission_submission.created',
        'entity_id' => $submission->id,
    ]);
});

it('pending user cannot submit and mission status blocks new submissions', function (): void {
    $pending = User::factory()->pendingApproval()->create();
    $pending->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    $mission = SocialMission::query()->where('status', SocialMission::STATUS_ACTIVE)->firstOrFail();

    $this->actingAs($pending)->post("/social-missions/{$mission->id}/submissions", [
        'evidence_text' => 'Tentativa',
    ])->assertRedirect('/approval/pending');

    $participant = makeMissionParticipant();

    foreach ([SocialMission::STATUS_DRAFT, SocialMission::STATUS_CLOSED, SocialMission::STATUS_CANCELLED] as $status) {
        $blockedMission = SocialMission::factory()->create([
            'status' => $status,
            'team_id' => $mission->team_id,
            'album_id' => $mission->album_id,
        ]);

        $this->actingAs($participant)
            ->from('/social-missions')
            ->post("/social-missions/{$blockedMission->id}/submissions", [
                'evidence_text' => 'Tentativa bloqueada',
            ])
            ->assertSessionHasErrors('submission');
    }
});

it('respects max submissions per user', function (): void {
    $participant = makeMissionParticipant();

    $mission = SocialMission::factory()->active()->create([
        'team_id' => Team::query()->where('slug', 'maha')->firstOrFail()->id,
        'album_id' => Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail()->id,
        'max_submissions_per_user' => 1,
    ]);

    $this->actingAs($participant)->post("/social-missions/{$mission->id}/submissions", [
        'evidence_text' => 'Primeira submissão',
    ])->assertRedirect();

    $this->actingAs($participant)
        ->from("/social-missions/{$mission->id}")
        ->post("/social-missions/{$mission->id}/submissions", [
            'evidence_text' => 'Segunda submissão',
        ])
        ->assertSessionHasErrors('submission');
});

it('admin approves and rejects submissions with correct effects', function (): void {
    $admin = makeMissionAdmin();
    $participant = makeMissionParticipant();
    $mission = SocialMission::query()->where('status', SocialMission::STATUS_ACTIVE)->firstOrFail();

    $submission = SocialMissionSubmission::factory()->create([
        'social_mission_id' => $mission->id,
        'user_id' => $participant->id,
        'status' => SocialMissionSubmission::STATUS_PENDING,
    ]);

    $this->actingAs($admin)->patch("/admin/social-mission-submissions/{$submission->id}/approve", [
        'note' => 'Evidência validada',
    ])->assertRedirect();

    $submission->refresh();
    $mission->refresh();

    expect($submission->status)->toBe(SocialMissionSubmission::STATUS_APPROVED);
    expect($mission->approved_count)->toBeGreaterThan(0);

    $packs = StickerPack::query()->where('social_mission_submission_id', $submission->id)->get();

    expect($packs->count())->toBe($mission->reward_pack_quantity);
    expect($packs->pluck('source')->unique()->values()->all())->toBe([StickerPack::SOURCE_SOCIAL_MISSION]);

    $this->assertDatabaseHas('audit_logs', ['action' => 'social_mission_submission.approved', 'entity_id' => $submission->id]);
    $this->assertDatabaseHas('audit_logs', ['action' => 'sticker_pack.granted_by_social_mission', 'entity_id' => $submission->id]);

    $secondSubmission = SocialMissionSubmission::factory()->create([
        'social_mission_id' => $mission->id,
        'user_id' => $participant->id,
        'status' => SocialMissionSubmission::STATUS_PENDING,
    ]);

    $this->actingAs($admin)->patch("/admin/social-mission-submissions/{$secondSubmission->id}/reject", [
        'rejection_reason' => 'Evidência insuficiente',
    ])->assertRedirect();

    $secondSubmission->refresh();

    expect($secondSubmission->status)->toBe(SocialMissionSubmission::STATUS_REJECTED);
    expect(StickerPack::query()->where('social_mission_submission_id', $secondSubmission->id)->count())->toBe(0);

    $this->assertDatabaseHas('audit_logs', ['action' => 'social_mission_submission.rejected', 'entity_id' => $secondSubmission->id]);
});

it('does not allow approve reject invalid states and supports closed mission review but blocks cancelled', function (): void {
    $admin = makeMissionAdmin();
    $participant = makeMissionParticipant();
    $activeMission = SocialMission::query()->where('status', SocialMission::STATUS_ACTIVE)->firstOrFail();

    $approvedSubmission = SocialMissionSubmission::factory()->approved()->create([
        'social_mission_id' => $activeMission->id,
        'user_id' => $participant->id,
    ]);

    $this->actingAs($admin)->patch("/admin/social-mission-submissions/{$approvedSubmission->id}/approve", [
        'note' => 'Tentativa duplicada',
    ])->assertSessionHasErrors('submission');

    $this->actingAs($admin)->patch("/admin/social-mission-submissions/{$approvedSubmission->id}/reject", [
        'rejection_reason' => 'Tentativa inválida',
    ])->assertSessionHasErrors('submission');

    $closedMission = SocialMission::factory()->closed()->create([
        'team_id' => $activeMission->team_id,
        'album_id' => $activeMission->album_id,
    ]);

    $pendingClosedSubmission = SocialMissionSubmission::factory()->create([
        'social_mission_id' => $closedMission->id,
        'user_id' => $participant->id,
        'status' => SocialMissionSubmission::STATUS_PENDING,
    ]);

    $this->actingAs($admin)->patch("/admin/social-mission-submissions/{$pendingClosedSubmission->id}/approve", [
        'note' => 'Aprovado pós-fechamento',
    ])->assertRedirect();

    $pendingClosedSubmission->refresh();
    expect($pendingClosedSubmission->status)->toBe(SocialMissionSubmission::STATUS_APPROVED);

    $cancelledMission = SocialMission::factory()->cancelled()->create([
        'team_id' => $activeMission->team_id,
        'album_id' => $activeMission->album_id,
    ]);

    $pendingCancelledSubmission = SocialMissionSubmission::factory()->create([
        'social_mission_id' => $cancelledMission->id,
        'user_id' => $participant->id,
        'status' => SocialMissionSubmission::STATUS_PENDING,
    ]);

    $this->actingAs($admin)->patch("/admin/social-mission-submissions/{$pendingCancelledSubmission->id}/approve", [
        'note' => 'Não deveria aprovar',
    ])->assertSessionHasErrors('submission');
});

it('participant can only see own submissions', function (): void {
    $userA = makeMissionParticipant();
    $userB = makeMissionParticipant();
    $mission = SocialMission::query()->where('status', SocialMission::STATUS_ACTIVE)->firstOrFail();

    $submissionA = SocialMissionSubmission::factory()->create([
        'social_mission_id' => $mission->id,
        'user_id' => $userA->id,
    ]);

    $submissionB = SocialMissionSubmission::factory()->create([
        'social_mission_id' => $mission->id,
        'user_id' => $userB->id,
    ]);

    $this->actingAs($userA)->get('/social-submissions')->assertOk()->assertSee((string) $submissionA->id);
    $this->actingAs($userA)->get("/social-submissions/{$submissionA->id}")->assertOk();
    $this->actingAs($userA)->get("/social-submissions/{$submissionB->id}")->assertForbidden();

    $admin = makeMissionAdmin();
    $this->actingAs($userA)->get('/admin/social-mission-submissions')->assertForbidden();
    $this->actingAs($admin)->get('/admin/social-mission-submissions')->assertOk();
});
