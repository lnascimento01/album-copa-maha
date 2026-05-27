<?php

use App\Models\Role;
use App\Models\SocialMission;
use App\Models\SocialMissionSubmission;
use App\Models\StickerPack;
use App\Models\User;
use App\Models\UserSticker;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeStage6IntegrationAdmin(): User
{
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    return $admin;
}

function makeStage6IntegrationParticipant(): User
{
    $user = User::factory()->create();
    $user->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $user;
}

it('reward code and social mission pack origins appear in packs and admin pack detail', function (): void {
    $admin = makeStage6IntegrationAdmin();
    $participant = makeStage6IntegrationParticipant();

    $this->actingAs($participant)->post('/reward-code', ['code' => 'MAHA10'])->assertRedirect();

    $mission = SocialMission::query()->where('status', SocialMission::STATUS_ACTIVE)->firstOrFail();

    $submission = SocialMissionSubmission::factory()->create([
        'social_mission_id' => $mission->id,
        'user_id' => $participant->id,
        'status' => SocialMissionSubmission::STATUS_PENDING,
    ]);

    $this->actingAs($admin)->patch("/admin/social-mission-submissions/{$submission->id}/approve", [
        'note' => 'Aprovado',
    ])->assertRedirect();

    $rewardPack = StickerPack::query()->where('user_id', $participant->id)->where('source', StickerPack::SOURCE_REWARD_CODE)->firstOrFail();
    $missionPack = StickerPack::query()->where('user_id', $participant->id)->where('source', StickerPack::SOURCE_SOCIAL_MISSION)->firstOrFail();

    $this->actingAs($participant)->get('/packs')
        ->assertOk()
        ->assertSee('reward_code')
        ->assertSee('social_mission');

    $this->actingAs($admin)->get("/admin/sticker-packs/{$rewardPack->id}")
        ->assertOk()
        ->assertSee((string) $rewardPack->reward_code_id);

    $this->actingAs($admin)->get('/admin/audit-logs')
        ->assertOk()
        ->assertSee('reward_code.redeemed')
        ->assertSee('social_mission_submission.approved');

    expect($missionPack->social_mission_submission_id)->toBe($submission->id);
});

it('participant opens packs from reward code and social mission and album reflects unlocks', function (): void {
    $admin = makeStage6IntegrationAdmin();
    $participant = makeStage6IntegrationParticipant();

    $this->actingAs($participant)->post('/reward-code', ['code' => 'MAHA10'])->assertRedirect();

    $mission = SocialMission::query()->where('status', SocialMission::STATUS_ACTIVE)->firstOrFail();

    $submission = SocialMissionSubmission::factory()->create([
        'social_mission_id' => $mission->id,
        'user_id' => $participant->id,
        'status' => SocialMissionSubmission::STATUS_PENDING,
    ]);

    $this->actingAs($admin)->patch("/admin/social-mission-submissions/{$submission->id}/approve", [
        'note' => 'Aprovado',
    ])->assertRedirect();

    $packs = StickerPack::query()->where('user_id', $participant->id)->where('status', StickerPack::STATUS_PENDING)->orderBy('id')->get();

    expect($packs->count())->toBeGreaterThanOrEqual(2);

    foreach ($packs as $pack) {
        $this->actingAs($participant)->post("/packs/{$pack->id}/open")->assertRedirect();
    }

    $openedPacks = StickerPack::query()->whereIn('id', $packs->pluck('id')->all())->where('status', StickerPack::STATUS_OPENED)->count();
    expect($openedPacks)->toBe($packs->count());

    $userStickerCount = UserSticker::query()->where('user_id', $participant->id)->count();
    expect($userStickerCount)->toBeGreaterThan(0);

    $oneUnlockedStickerId = UserSticker::query()->where('user_id', $participant->id)->value('sticker_id');

    $this->actingAs($participant)->get('/album')->assertOk();
    $this->actingAs($participant)->get("/album/stickers/{$oneUnlockedStickerId}")->assertOk();
});
