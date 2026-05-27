<?php

use App\Models\Activity;
use App\Models\ActivityCheckin;
use App\Models\Album;
use App\Models\Role;
use App\Models\StickerPack;
use App\Models\Team;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeCheckinAdmin(): User
{
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    return $admin;
}

function makeApprovedParticipantForCheckin(): User
{
    $participant = User::factory()->create();
    $participant->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $participant;
}

it('admin confirms checkin for approved user and generates packs with origin', function (): void {
    $admin = makeCheckinAdmin();
    $participant = makeApprovedParticipantForCheckin();
    $team = Team::query()->where('slug', 'maha')->firstOrFail();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $activity = Activity::factory()->open()->create([
        'team_id' => $team->id,
        'album_id' => $album->id,
        'reward_pack_quantity' => 2,
        'reward_pack_size' => 3,
    ]);

    $this->actingAs($admin)->post("/admin/activities/{$activity->id}/checkins", [
        'user_id' => $participant->id,
        'notes' => 'Presença confirmada',
    ])->assertRedirect();

    $checkin = ActivityCheckin::query()->where('activity_id', $activity->id)->where('user_id', $participant->id)->firstOrFail();

    expect($checkin->status)->toBe(ActivityCheckin::STATUS_CONFIRMED);

    $packs = StickerPack::query()->where('activity_checkin_id', $checkin->id)->orderBy('id')->get();

    expect($packs)->toHaveCount(2);
    expect($packs->pluck('source')->unique()->values()->all())->toBe([StickerPack::SOURCE_CHECKIN]);

    foreach ($packs as $pack) {
        expect($pack->activity_id)->toBe($activity->id);
        expect($pack->activity_checkin_id)->toBe($checkin->id);
        expect($pack->granted_by)->toBe($admin->id);
        expect($pack->status)->toBe(StickerPack::STATUS_PENDING);
    }

    $this->assertDatabaseHas('audit_logs', ['action' => 'activity_checkin.confirmed', 'entity_id' => $checkin->id]);
    $this->assertDatabaseHas('audit_logs', ['action' => 'sticker_pack.granted_by_checkin', 'entity_id' => $checkin->id]);
});

it('does not allow checkin for pending user or duplicate', function (): void {
    $admin = makeCheckinAdmin();
    $approved = makeApprovedParticipantForCheckin();
    $pending = User::factory()->pendingApproval()->create();
    $pending->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $activity = Activity::factory()->open()->create([
        'team_id' => $album->team_id,
        'album_id' => $album->id,
    ]);

    $this->actingAs($admin)->post("/admin/activities/{$activity->id}/checkins", [
        'user_id' => $pending->id,
    ])->assertSessionHasErrors('user_id');

    $this->actingAs($admin)->post("/admin/activities/{$activity->id}/checkins", [
        'user_id' => $approved->id,
    ])->assertRedirect();

    $this->actingAs($admin)->post("/admin/activities/{$activity->id}/checkins", [
        'user_id' => $approved->id,
    ])->assertSessionHasErrors('checkin');
});

it('does not allow checkin on draft closed or cancelled activity', function (): void {
    $admin = makeCheckinAdmin();
    $participant = makeApprovedParticipantForCheckin();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $draft = Activity::factory()->create(['team_id' => $album->team_id, 'album_id' => $album->id, 'status' => Activity::STATUS_DRAFT]);
    $closed = Activity::factory()->closed()->create(['team_id' => $album->team_id, 'album_id' => $album->id]);
    $cancelled = Activity::factory()->cancelled()->create(['team_id' => $album->team_id, 'album_id' => $album->id]);

    $this->actingAs($admin)->post("/admin/activities/{$draft->id}/checkins", ['user_id' => $participant->id])->assertSessionHasErrors('checkin');
    $this->actingAs($admin)->post("/admin/activities/{$closed->id}/checkins", ['user_id' => $participant->id])->assertSessionHasErrors('checkin');
    $this->actingAs($admin)->post("/admin/activities/{$cancelled->id}/checkins", ['user_id' => $participant->id])->assertSessionHasErrors('checkin');
});

it('participant cannot perform admin checkin action', function (): void {
    $participant = makeApprovedParticipantForCheckin();
    $other = makeApprovedParticipantForCheckin();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $activity = Activity::factory()->open()->create(['team_id' => $album->team_id, 'album_id' => $album->id]);

    $this->actingAs($participant)->post("/admin/activities/{$activity->id}/checkins", [
        'user_id' => $other->id,
    ])->assertForbidden();
});
