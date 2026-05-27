<?php

use App\Models\Achievement;
use App\Models\Activity;
use App\Models\ActivityCheckin;
use App\Models\Album;
use App\Models\RewardCode;
use App\Models\RewardCodeRedemption;
use App\Models\Role;
use App\Models\SocialMission;
use App\Models\SocialMissionSubmission;
use App\Models\StickerPack;
use App\Models\User;
use App\Models\UserAchievement;
use App\Models\UserSticker;
use App\Services\Rankings\BuildAlbumRankingService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeRankingAdmin(): User
{
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    return $admin;
}

function makeRankingParticipant(array $attributes = []): User
{
    $user = User::factory()->create($attributes);
    $user->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $user;
}

it('admin accesses admin rankings and participant accesses own ranking', function (): void {
    $admin = makeRankingAdmin();
    $participant = makeRankingParticipant();

    $this->actingAs($admin)->get('/admin/rankings')->assertOk();
    $this->actingAs($participant)->get('/ranking')->assertOk();
});

it('pending user cannot access ranking', function (): void {
    $pending = makeRankingParticipant([
        'approval_status' => User::APPROVAL_PENDING,
        'approved_at' => null,
    ]);

    $this->actingAs($pending)->get('/ranking')->assertRedirect('/approval/pending');
});

it('ranking excludes admins by default and includes only approved users ordered by score', function (): void {
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $activity = Activity::query()->where('album_id', $album->id)->where('status', Activity::STATUS_OPEN)->firstOrFail();
    $rewardCode = RewardCode::query()->where('album_id', $album->id)->where('status', RewardCode::STATUS_ACTIVE)->firstOrFail();
    $mission = SocialMission::query()->where('album_id', $album->id)->where('status', SocialMission::STATUS_ACTIVE)->firstOrFail();
    $achievement = Achievement::query()->where('slug', 'primeira-figurinha')->firstOrFail();

    $admin = makeRankingAdmin();
    $high = makeRankingParticipant();
    $low = makeRankingParticipant();
    $pending = makeRankingParticipant([
        'approval_status' => User::APPROVAL_PENDING,
        'approved_at' => null,
    ]);

    $stickerIds = $album->stickers()->where('is_active', true)->limit(3)->pluck('id')->all();

    foreach ($stickerIds as $stickerId) {
        UserSticker::query()->create([
            'user_id' => $high->id,
            'sticker_id' => $stickerId,
            'source' => 'seed',
            'source_id' => null,
            'unlocked_at' => now(),
            'created_at' => now(),
        ]);
    }

    StickerPack::factory()->opened()->create([
        'user_id' => $high->id,
        'album_id' => $album->id,
        'size' => 3,
    ]);

    ActivityCheckin::factory()->create([
        'activity_id' => $activity->id,
        'user_id' => $high->id,
        'checked_by' => $high->id,
        'status' => ActivityCheckin::STATUS_CONFIRMED,
    ]);

    RewardCodeRedemption::factory()->create([
        'reward_code_id' => $rewardCode->id,
        'user_id' => $high->id,
    ]);

    SocialMissionSubmission::factory()->approved()->create([
        'social_mission_id' => $mission->id,
        'user_id' => $high->id,
    ]);

    UserAchievement::factory()->create([
        'user_id' => $high->id,
        'achievement_id' => $achievement->id,
        'album_id' => $album->id,
    ]);

    UserSticker::query()->create([
        'user_id' => $low->id,
        'sticker_id' => $stickerIds[0],
        'source' => 'seed',
        'source_id' => null,
        'unlocked_at' => now(),
        'created_at' => now(),
    ]);

    $this->actingAs($high)->get('/ranking')->assertOk();

    $top = app(BuildAlbumRankingService::class)->build(includeAdmins: false)['rows']->values()->all();
    expect($top[0]['user_id'])->toBe($high->id);

    $userIds = array_column($top, 'user_id');
    expect($userIds)->not->toContain($admin->id);
    expect($userIds)->not->toContain($pending->id);

    $scores = array_column($top, 'score');
    $sorted = $scores;
    rsort($sorted);
    expect($scores)->toBe($sorted);
});
