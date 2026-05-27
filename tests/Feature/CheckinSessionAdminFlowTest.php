<?php

use App\Models\Activity;
use App\Models\ActivityCheckinSession;
use App\Models\Album;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeSessionAdminUser(): User
{
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    return $admin;
}

function makeSessionParticipantUser(): User
{
    $user = User::factory()->create();
    $user->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $user;
}

it('admin creates checkin session for open activity and stores only token hash', function (): void {
    $admin = makeSessionAdminUser();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $activity = Activity::factory()->open()->create([
        'team_id' => $album->team_id,
        'album_id' => $album->id,
    ]);

    $response = $this->actingAs($admin)->post("/admin/activities/{$activity->id}/checkin-sessions", [
        'duration_minutes' => 15,
        'max_uses' => 5,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('selfCheckin');

    $session = ActivityCheckinSession::query()->where('activity_id', $activity->id)->latest('id')->firstOrFail();

    expect($session->token_hash)->not->toBe('');
    expect($session->status)->toBe(ActivityCheckinSession::STATUS_ACTIVE);

    $flash = $response->getSession()->get('selfCheckin');
    expect($flash)->not->toBeNull();
    expect($flash['public_url'])->toContain('/checkin/');

    $rawToken = basename($flash['public_url']);

    expect($session->token_hash)->not->toBe($rawToken);

    $this->assertDatabaseMissing('activity_checkin_sessions', [
        'token_hash' => $rawToken,
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'activity_checkin_session.created',
        'entity_id' => $session->id,
    ]);
});

it('participant cannot create checkin session', function (): void {
    $participant = makeSessionParticipantUser();
    $activity = Activity::query()->where('status', Activity::STATUS_OPEN)->firstOrFail();

    $this->actingAs($participant)->post("/admin/activities/{$activity->id}/checkin-sessions", [
        'duration_minutes' => 15,
    ])->assertForbidden();
});

it('does not create session for draft closed cancelled or non-active album activity', function (): void {
    $admin = makeSessionAdminUser();
    $activeAlbum = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $draft = Activity::factory()->create([
        'status' => Activity::STATUS_DRAFT,
        'team_id' => $activeAlbum->team_id,
        'album_id' => $activeAlbum->id,
    ]);

    $closed = Activity::factory()->closed()->create([
        'team_id' => $activeAlbum->team_id,
        'album_id' => $activeAlbum->id,
    ]);

    $cancelled = Activity::factory()->cancelled()->create([
        'team_id' => $activeAlbum->team_id,
        'album_id' => $activeAlbum->id,
    ]);

    $archivedAlbum = Album::factory()->archived()->create(['team_id' => $activeAlbum->team_id]);
    $openBadAlbum = Activity::factory()->open()->create([
        'team_id' => $activeAlbum->team_id,
        'album_id' => $archivedAlbum->id,
    ]);

    foreach ([$draft, $closed, $cancelled, $openBadAlbum] as $activity) {
        $this->actingAs($admin)->post("/admin/activities/{$activity->id}/checkin-sessions", [
            'duration_minutes' => 15,
        ])->assertSessionHasErrors('session');
    }
});

it('admin revokes active session and writes audit log', function (): void {
    $admin = makeSessionAdminUser();
    $session = ActivityCheckinSession::factory()->create();

    $this->actingAs($admin)->patch("/admin/activity-checkin-sessions/{$session->id}/revoke", [
        'revoke_reason' => 'Encerrado manualmente',
    ])->assertRedirect();

    $session->refresh();

    expect($session->status)->toBe(ActivityCheckinSession::STATUS_REVOKED);
    expect($session->revoked_at)->not->toBeNull();

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'activity_checkin_session.revoked',
        'entity_id' => $session->id,
    ]);
});
