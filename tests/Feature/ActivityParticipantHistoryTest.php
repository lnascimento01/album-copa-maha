<?php

use App\Models\Activity;
use App\Models\ActivityCheckin;
use App\Models\Album;
use App\Models\Role;
use App\Models\StickerPack;
use App\Models\User;
use App\Models\UserSticker;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeHistoryAdmin(): User
{
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    return $admin;
}

function makeHistoryParticipant(): User
{
    $participant = User::factory()->create();
    $participant->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $participant;
}

it('participant sees own checkins and cannot see others', function (): void {
    $participant = makeHistoryParticipant();
    $other = makeHistoryParticipant();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $activity = Activity::factory()->open()->create(['team_id' => $album->team_id, 'album_id' => $album->id]);

    $own = ActivityCheckin::factory()->create([
        'activity_id' => $activity->id,
        'user_id' => $participant->id,
        'status' => ActivityCheckin::STATUS_CONFIRMED,
    ]);

    $foreign = ActivityCheckin::factory()->create([
        'activity_id' => $activity->id,
        'user_id' => $other->id,
        'status' => ActivityCheckin::STATUS_CONFIRMED,
    ]);

    $this->actingAs($participant)->get('/checkins')->assertOk()->assertSee('"component":"checkins\\/index"', false);
    $this->actingAs($participant)->get("/checkins/{$own->id}")->assertOk()->assertSee('"component":"checkins\\/show"', false);
    $this->actingAs($participant)->get("/checkins/{$foreign->id}")->assertForbidden();
});

it('packs list shows checkin origin and admin sees origin in admin sticker pack detail', function (): void {
    $admin = makeHistoryAdmin();
    $participant = makeHistoryParticipant();
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

    $pack = StickerPack::query()->where('source', StickerPack::SOURCE_CHECKIN)->latest('id')->firstOrFail();

    $this->actingAs($participant)->get('/packs')->assertOk()->assertSee($activity->title);
    $this->actingAs($admin)->get("/admin/sticker-packs/{$pack->id}")->assertOk()->assertSee($activity->title);
});

it('participant opens checkin pack and album reflects unlock and checkin keeps auditable origin', function (): void {
    $admin = makeHistoryAdmin();
    $participant = makeHistoryParticipant();
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

    $pack = StickerPack::query()->where('source', StickerPack::SOURCE_CHECKIN)->latest('id')->firstOrFail();

    $this->actingAs($participant)->post("/packs/{$pack->id}/open")->assertRedirect();

    $pack->refresh();
    expect($pack->status)->toBe(StickerPack::STATUS_OPENED);
    expect($pack->activity_id)->toBe($activity->id);
    expect($pack->activity_checkin_id)->not->toBeNull();

    $unlockedStickerId = UserSticker::query()->where('source', 'pack')->where('source_id', $pack->id)->value('sticker_id');
    expect($unlockedStickerId)->not->toBeNull();

    $this->actingAs($participant)->get('/album')->assertOk()->assertSee('"is_unlocked":true', false);
    $this->actingAs($participant)->get("/album/stickers/{$unlockedStickerId}")->assertOk()->assertSee('"is_full_visible":true', false);

    $this->assertDatabaseHas('audit_logs', ['action' => 'sticker_pack.opened', 'entity_id' => $pack->id]);
});
