<?php

declare(strict_types=1);

use App\Models\Activity;
use App\Models\Album;
use App\Models\Role;
use App\Models\SocialMission;
use App\Models\SocialMissionSubmission;
use App\Models\Sticker;
use App\Models\StickerPack;
use App\Models\User;
use App\Models\UserSticker;
use App\Services\Activities\ConfirmActivityCheckinService;
use App\Services\Activities\Exceptions\ActivityCheckinException;
use App\Services\Rewards\Exceptions\RewardCodeRedeemException;
use App\Services\Rewards\RedeemRewardCodeService;
use App\Services\Stickers\Exceptions\StickerPackOpenException;
use App\Services\Stickers\OpenStickerPackService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeHardeningUser(string $roleSlug, string $state = 'approved'): User
{
    $user = match ($state) {
        'pending' => User::factory()->pendingApproval()->create(),
        default => User::factory()->create(),
    };

    $role = Role::query()->where('slug', $roleSlug)->firstOrFail();
    $user->roles()->sync([$role->id]);

    return $user;
}

it('opened or cancelled pack cannot be opened again', function (): void {
    $participant = makeHardeningUser('participant');
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $opened = StickerPack::factory()->create([
        'user_id' => $participant->id,
        'album_id' => $album->id,
        'status' => StickerPack::STATUS_OPENED,
    ]);

    $cancelled = StickerPack::factory()->create([
        'user_id' => $participant->id,
        'album_id' => $album->id,
        'status' => StickerPack::STATUS_CANCELLED,
    ]);

    $this->actingAs($participant)
        ->post("/packs/{$opened->id}/open")
        ->assertSessionHasErrors('pack');

    $this->actingAs($participant)
        ->post("/packs/{$cancelled->id}/open")
        ->assertSessionHasErrors('pack');
});

it('pack from another user cannot be opened', function (): void {
    $owner = makeHardeningUser('participant');
    $intruder = makeHardeningUser('participant');
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $pack = StickerPack::factory()->create([
        'user_id' => $owner->id,
        'album_id' => $album->id,
        'status' => StickerPack::STATUS_PENDING,
    ]);

    $this->actingAs($intruder)
        ->post("/packs/{$pack->id}/open")
        ->assertSessionHasErrors('pack');
});

it('album completed user cannot open new pack for same album', function (): void {
    $participant = makeHardeningUser('participant');
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $pack = StickerPack::factory()->create([
        'user_id' => $participant->id,
        'album_id' => $album->id,
        'status' => StickerPack::STATUS_PENDING,
        'size' => 3,
    ]);

    $now = now();
    $activeStickerIds = Sticker::query()
        ->where('album_id', $album->id)
        ->where('is_active', true)
        ->pluck('id')
        ->all();

    UserSticker::query()->insert(
        collect($activeStickerIds)->map(fn (int $stickerId): array => [
            'user_id' => $participant->id,
            'sticker_id' => $stickerId,
            'source' => 'seed',
            'source_id' => null,
            'unlocked_at' => $now,
            'created_at' => $now,
        ])->all(),
    );

    try {
        app(OpenStickerPackService::class)->openForUser($pack->id, $participant);
        $this->fail('Expected StickerPackOpenException for no missing stickers.');
    } catch (StickerPackOpenException $exception) {
        expect($exception->reason)->toBe('no_missing_stickers');
    }
});

it('checkin service blocks draft activity, pending user and duplicates', function (): void {
    $admin = makeHardeningUser('admin');
    $approvedParticipant = makeHardeningUser('participant');
    $pendingParticipant = makeHardeningUser('participant', 'pending');
    $service = app(ConfirmActivityCheckinService::class);

    $draftActivity = Activity::factory()->create([
        'status' => Activity::STATUS_DRAFT,
        'team_id' => Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail()->team_id,
        'album_id' => Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail()->id,
    ]);

    try {
        $service->confirm($draftActivity->id, $approvedParticipant->id, $admin);
        $this->fail('Expected ActivityCheckinException for draft activity.');
    } catch (ActivityCheckinException $exception) {
        expect($exception->reason)->toBe('activity_not_open');
    }

    $openActivity = Activity::factory()->open()->create([
        'team_id' => $draftActivity->team_id,
        'album_id' => $draftActivity->album_id,
    ]);

    try {
        $service->confirm($openActivity->id, $pendingParticipant->id, $admin);
        $this->fail('Expected ActivityCheckinException for pending participant.');
    } catch (ActivityCheckinException $exception) {
        expect($exception->reason)->toBe('user_not_approved');
    }

    $service->confirm($openActivity->id, $approvedParticipant->id, $admin);

    try {
        $service->confirm($openActivity->id, $approvedParticipant->id, $admin);
        $this->fail('Expected ActivityCheckinException for duplicate checkin.');
    } catch (ActivityCheckinException $exception) {
        expect($exception->reason)->toBe('duplicate_checkin');
    }
});

it('invalid or unavailable reward code is blocked with controlled error', function (): void {
    $participant = makeHardeningUser('participant');
    $service = app(RedeemRewardCodeService::class);

    try {
        $service->redeem('CODIGO-INEXISTENTE', $participant);
        $this->fail('Expected RewardCodeRedeemException for invalid code.');
    } catch (RewardCodeRedeemException $exception) {
        expect($exception->reason)->toBe('invalid_code');
    }
});

it('closed mission blocks new submissions and cancelled mission blocks approval', function (): void {
    $admin = makeHardeningUser('admin');
    $participant = makeHardeningUser('participant');
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $closedMission = SocialMission::factory()->closed()->create([
        'team_id' => $album->team_id,
        'album_id' => $album->id,
    ]);

    $this->actingAs($participant)
        ->post("/social-missions/{$closedMission->id}/submissions", [
            'evidence_text' => 'Minha evidência',
        ])
        ->assertSessionHasErrors('submission');

    $cancelledMission = SocialMission::factory()->cancelled()->create([
        'team_id' => $album->team_id,
        'album_id' => $album->id,
    ]);

    $submission = SocialMissionSubmission::factory()->create([
        'social_mission_id' => $cancelledMission->id,
        'user_id' => $participant->id,
        'status' => SocialMissionSubmission::STATUS_PENDING,
    ]);

    $this->actingAs($admin)
        ->patch("/admin/social-mission-submissions/{$submission->id}/approve", [])
        ->assertSessionHasErrors('submission');
});

it('rejecting mission submission requires explicit reason', function (): void {
    $admin = makeHardeningUser('admin');
    $participant = makeHardeningUser('participant');
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $mission = SocialMission::factory()->active()->create([
        'team_id' => $album->team_id,
        'album_id' => $album->id,
    ]);

    $submission = SocialMissionSubmission::factory()->create([
        'social_mission_id' => $mission->id,
        'user_id' => $participant->id,
        'status' => SocialMissionSubmission::STATUS_PENDING,
    ]);

    $this->actingAs($admin)
        ->patch("/admin/social-mission-submissions/{$submission->id}/reject", [
            'rejection_reason' => '',
        ])
        ->assertSessionHasErrors('rejection_reason');
});
