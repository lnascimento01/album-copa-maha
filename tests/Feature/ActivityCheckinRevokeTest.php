<?php

use App\Models\Activity;
use App\Models\ActivityCheckin;
use App\Models\Album;
use App\Models\Role;
use App\Models\Sticker;
use App\Models\StickerPack;
use App\Models\StickerPackItem;
use App\Models\User;
use App\Models\UserSticker;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeRevokeAdmin(): User
{
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    return $admin;
}

function makeRevokeParticipant(): User
{
    $participant = User::factory()->create();
    $participant->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $participant;
}

it('admin revokes confirmed checkin and cancels pending packs', function (): void {
    $admin = makeRevokeAdmin();
    $participant = makeRevokeParticipant();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $activity = Activity::factory()->open()->create([
        'team_id' => $album->team_id,
        'album_id' => $album->id,
        'reward_pack_quantity' => 2,
        'reward_pack_size' => 3,
    ]);

    $this->actingAs($admin)->post("/admin/activities/{$activity->id}/checkins", [
        'user_id' => $participant->id,
    ])->assertRedirect();

    $checkin = ActivityCheckin::query()->where('activity_id', $activity->id)->where('user_id', $participant->id)->firstOrFail();

    $this->actingAs($admin)->patch("/admin/activity-checkins/{$checkin->id}/revoke", [
        'revoke_reason' => 'Treino cancelado',
    ])->assertRedirect();

    $checkin->refresh();
    expect($checkin->status)->toBe(ActivityCheckin::STATUS_REVOKED);
    expect($checkin->revoked_at)->not->toBeNull();

    $packs = StickerPack::query()->where('activity_checkin_id', $checkin->id)->get();

    expect($packs->pluck('status')->unique()->values()->all())->toBe([StickerPack::STATUS_CANCELLED]);

    $this->assertDatabaseHas('audit_logs', ['action' => 'activity_checkin.revoked', 'entity_id' => $checkin->id]);
});

it('cannot revoke if any linked pack was opened and logs revoke denied', function (): void {
    $admin = makeRevokeAdmin();
    $participant = makeRevokeParticipant();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $activity = Activity::factory()->open()->create([
        'team_id' => $album->team_id,
        'album_id' => $album->id,
        'reward_pack_quantity' => 1,
        'reward_pack_size' => 1,
    ]);

    $this->actingAs($admin)->post("/admin/activities/{$activity->id}/checkins", [
        'user_id' => $participant->id,
    ])->assertRedirect();

    $checkin = ActivityCheckin::query()->where('activity_id', $activity->id)->where('user_id', $participant->id)->firstOrFail();
    $pack = StickerPack::query()->where('activity_checkin_id', $checkin->id)->firstOrFail();

    $sticker = Sticker::query()->where('album_id', $album->id)->where('is_active', true)->firstOrFail();

    StickerPackItem::query()->create([
        'sticker_pack_id' => $pack->id,
        'sticker_id' => $sticker->id,
        'created_at' => now(),
    ]);

    UserSticker::query()->create([
        'user_id' => $participant->id,
        'sticker_id' => $sticker->id,
        'source' => 'pack',
        'source_id' => $pack->id,
        'unlocked_at' => now(),
        'created_at' => now(),
    ]);

    $pack->forceFill([
        'status' => StickerPack::STATUS_OPENED,
        'opened_at' => now(),
    ])->save();

    $this->actingAs($admin)->patch("/admin/activity-checkins/{$checkin->id}/revoke", [
        'revoke_reason' => 'Tentativa de revogação',
    ])->assertSessionHasErrors('checkin');

    $checkin->refresh();
    expect($checkin->status)->toBe(ActivityCheckin::STATUS_CONFIRMED);

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'activity_checkin.revoke_denied',
        'entity_id' => $checkin->id,
    ]);
});

it('participant cannot revoke checkin', function (): void {
    $admin = makeRevokeAdmin();
    $participant = makeRevokeParticipant();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $activity = Activity::factory()->open()->create([
        'team_id' => $album->team_id,
        'album_id' => $album->id,
    ]);

    $this->actingAs($admin)->post("/admin/activities/{$activity->id}/checkins", [
        'user_id' => $participant->id,
    ])->assertRedirect();

    $checkin = ActivityCheckin::query()->where('activity_id', $activity->id)->where('user_id', $participant->id)->firstOrFail();

    $this->actingAs($participant)->patch("/admin/activity-checkins/{$checkin->id}/revoke", [
        'revoke_reason' => 'não deveria',
    ])->assertForbidden();
});
