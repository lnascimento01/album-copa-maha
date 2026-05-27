<?php

use App\Models\Activity;
use App\Models\ActivityCheckin;
use App\Models\ActivityCheckinSession;
use App\Models\Album;
use App\Models\Role;
use App\Models\StickerPack;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeSelfAdmin(): User
{
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    return $admin;
}

function makeSelfParticipant(): User
{
    $user = User::factory()->create();
    $user->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $user;
}

/**
 * @return array{session: ActivityCheckinSession, raw_token: string}
 */
function createTokenSession(array $overrides = []): array
{
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $activity = Activity::factory()->open()->create([
        'team_id' => $album->team_id,
        'album_id' => $album->id,
        ...($overrides['activity'] ?? []),
    ]);

    $rawToken = Str::random(64);

    $session = ActivityCheckinSession::factory()->create([
        'activity_id' => $activity->id,
        'token_hash' => hash_hmac('sha256', $rawToken, (string) config('app.key')),
        ...($overrides['session'] ?? []),
    ]);

    return ['session' => $session, 'raw_token' => $rawToken];
}

it('approved participant accesses token page and confirms self checkin', function (): void {
    $participant = makeSelfParticipant();
    $sessionData = createTokenSession();
    $session = $sessionData['session'];
    $rawToken = $sessionData['raw_token'];

    $this->actingAs($participant)
        ->get("/checkin/{$rawToken}")
        ->assertOk()
        ->assertSee('"component":"checkin\\/token"', false);

    $this->actingAs($participant)
        ->post("/checkin/{$rawToken}/confirm")
        ->assertRedirect("/checkin/{$rawToken}");

    $checkin = ActivityCheckin::query()
        ->where('activity_id', $session->activity_id)
        ->where('user_id', $participant->id)
        ->firstOrFail();

    expect($checkin->metadata['self_checkin'] ?? false)->toBeTrue();

    $packs = StickerPack::query()->where('activity_checkin_id', $checkin->id)->get();

    expect($packs->count())->toBeGreaterThan(0);
    expect($packs->pluck('source')->unique()->values()->all())->toBe([StickerPack::SOURCE_CHECKIN]);

    $session->refresh();
    expect($session->used_count)->toBe(1);

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'activity_checkin.self_confirmed',
        'entity_id' => $checkin->id,
    ]);
});

it('invalid token returns controlled message and logs invalid attempt', function (): void {
    $participant = makeSelfParticipant();

    $this->actingAs($participant)
        ->from('/checkin/not-valid-token')
        ->post('/checkin/not-valid-token/confirm')
        ->assertSessionHasErrors('checkin');

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'activity_checkin_session.invalid_attempt',
        'actor_user_id' => $participant->id,
    ]);
});

it('expired not started revoked and max uses sessions are blocked without side effects', function (): void {
    $participant = makeSelfParticipant();

    $expired = createTokenSession([
        'session' => [
            'status' => ActivityCheckinSession::STATUS_EXPIRED,
            'expires_at' => now()->subMinute(),
        ],
    ]);

    $notStarted = createTokenSession([
        'session' => [
            'starts_at' => now()->addMinutes(10),
            'expires_at' => now()->addHour(),
        ],
    ]);

    $revoked = createTokenSession([
        'session' => [
            'status' => ActivityCheckinSession::STATUS_REVOKED,
        ],
    ]);

    $limited = createTokenSession([
        'session' => [
            'max_uses' => 1,
            'used_count' => 1,
        ],
    ]);

    foreach ([$expired, $notStarted, $revoked, $limited] as $data) {
        $session = $data['session'];
        $rawToken = $data['raw_token'];

        $beforeUsedCount = $session->used_count;

        $this->actingAs($participant)
            ->from("/checkin/{$rawToken}")
            ->post("/checkin/{$rawToken}/confirm")
            ->assertSessionHasErrors('checkin');

        $session->refresh();
        expect($session->used_count)->toBe($beforeUsedCount);

        $this->assertDatabaseMissing('activity_checkins', [
            'activity_id' => $session->activity_id,
            'user_id' => $participant->id,
        ]);
    }
});

it('pending user and user without permission cannot self confirm', function (): void {
    $pending = User::factory()->pendingApproval()->create();
    $pending->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    $noPermission = User::factory()->create();

    $sessionData = createTokenSession();
    $rawToken = $sessionData['raw_token'];

    $this->actingAs($pending)
        ->post("/checkin/{$rawToken}/confirm")
        ->assertRedirect('/approval/pending');

    $this->actingAs($noPermission)
        ->post("/checkin/{$rawToken}/confirm")
        ->assertForbidden();
});

it('same user cannot confirm twice and duplicate does not create extra packages', function (): void {
    $participant = makeSelfParticipant();
    $sessionData = createTokenSession();
    $session = $sessionData['session'];
    $rawToken = $sessionData['raw_token'];

    $this->actingAs($participant)->post("/checkin/{$rawToken}/confirm")->assertRedirect();
    $this->actingAs($participant)
        ->from("/checkin/{$rawToken}")
        ->post("/checkin/{$rawToken}/confirm")
        ->assertSessionHasErrors('checkin');

    expect(ActivityCheckin::query()->where('activity_id', $session->activity_id)->where('user_id', $participant->id)->count())->toBe(1);

    $checkin = ActivityCheckin::query()->where('activity_id', $session->activity_id)->where('user_id', $participant->id)->firstOrFail();

    $packCount = StickerPack::query()->where('activity_checkin_id', $checkin->id)->count();
    expect($packCount)->toBeGreaterThan(0);

    $session->refresh();
    expect($session->used_count)->toBe(1);
});

it('max uses is respected across users', function (): void {
    $userA = makeSelfParticipant();
    $userB = makeSelfParticipant();

    $sessionData = createTokenSession([
        'session' => [
            'max_uses' => 1,
            'used_count' => 0,
        ],
    ]);
    $session = $sessionData['session'];
    $rawToken = $sessionData['raw_token'];

    $this->actingAs($userA)->post("/checkin/{$rawToken}/confirm")->assertRedirect();

    $this->actingAs($userB)
        ->from("/checkin/{$rawToken}")
        ->post("/checkin/{$rawToken}/confirm")
        ->assertSessionHasErrors('checkin');

    $session->refresh();

    expect($session->used_count)->toBe(1);
    expect(ActivityCheckin::query()->where('activity_id', $session->activity_id)->count())->toBe(1);
});
