<?php

use App\Models\Achievement;
use App\Models\Activity;
use App\Models\Album;
use App\Models\Role;
use App\Models\ShareCard;
use App\Models\SocialMission;
use App\Models\SocialMissionSubmission;
use App\Models\StickerPack;
use App\Models\User;
use App\Models\UserAchievement;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeStage7FlowAdmin(): User
{
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    return $admin;
}

function makeStage7FlowParticipant(): User
{
    $participant = User::factory()->create();
    $participant->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $participant;
}

it('opening pack evaluates achievements and creates cards', function (): void {
    $participant = makeStage7FlowParticipant();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $pack = StickerPack::factory()->create([
        'user_id' => $participant->id,
        'album_id' => $album->id,
        'status' => StickerPack::STATUS_PENDING,
        'size' => 1,
        'source' => StickerPack::SOURCE_ADMIN,
    ]);

    $this->actingAs($participant)->post("/packs/{$pack->id}/open")->assertRedirect();

    $firstStickerAchievement = Achievement::query()->where('slug', 'primeira-figurinha')->firstOrFail();

    expect(UserAchievement::query()->where('user_id', $participant->id)->where('achievement_id', $firstStickerAchievement->id)->exists())->toBeTrue();
    expect(ShareCard::query()->where('user_id', $participant->id)->where('type', ShareCard::TYPE_PACK_OPENED)->exists())->toBeTrue();
    expect(ShareCard::query()->where('user_id', $participant->id)->where('type', ShareCard::TYPE_ACHIEVEMENT_UNLOCKED)->exists())->toBeTrue();
});

it('admin checkin confirmation evaluates checkin achievement', function (): void {
    $admin = makeStage7FlowAdmin();
    $participant = makeStage7FlowParticipant();
    $activity = Activity::query()->where('status', Activity::STATUS_OPEN)->firstOrFail();

    $this->actingAs($admin)->post("/admin/activities/{$activity->id}/checkins", [
        'user_id' => $participant->id,
        'notes' => 'presente',
    ])->assertRedirect();

    $checkinAchievement = Achievement::query()->where('slug', 'presenca-confirmada')->firstOrFail();

    expect(UserAchievement::query()->where('user_id', $participant->id)->where('achievement_id', $checkinAchievement->id)->exists())->toBeTrue();
    expect(ShareCard::query()->where('user_id', $participant->id)->where('type', ShareCard::TYPE_CHECKIN_CONFIRMED)->exists())->toBeTrue();
});

it('redeeming reward code evaluates reward code achievement', function (): void {
    $participant = makeStage7FlowParticipant();

    $this->actingAs($participant)->post('/reward-code', [
        'code' => 'MAHA10',
    ])->assertRedirect('/reward-code');

    $rewardAchievement = Achievement::query()->where('slug', 'codigo-resgatado')->firstOrFail();

    expect(UserAchievement::query()->where('user_id', $participant->id)->where('achievement_id', $rewardAchievement->id)->exists())->toBeTrue();
});

it('approving social mission submission evaluates mission achievement and creates share card', function (): void {
    $admin = makeStage7FlowAdmin();
    $participant = makeStage7FlowParticipant();
    $mission = SocialMission::query()->where('status', SocialMission::STATUS_ACTIVE)->firstOrFail();

    $submission = SocialMissionSubmission::factory()->create([
        'social_mission_id' => $mission->id,
        'user_id' => $participant->id,
        'status' => SocialMissionSubmission::STATUS_PENDING,
    ]);

    $this->actingAs($admin)->patch("/admin/social-mission-submissions/{$submission->id}/approve", [
        'note' => 'ok',
    ])->assertRedirect();

    $missionAchievement = Achievement::query()->where('slug', 'missao-social-aprovada')->firstOrFail();

    expect(UserAchievement::query()->where('user_id', $participant->id)->where('achievement_id', $missionAchievement->id)->exists())->toBeTrue();
    expect(ShareCard::query()->where('user_id', $participant->id)->where('type', ShareCard::TYPE_SOCIAL_MISSION_APPROVED)->exists())->toBeTrue();
});
