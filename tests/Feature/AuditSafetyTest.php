<?php

declare(strict_types=1);

use App\Models\Activity;
use App\Models\ActivityCheckin;
use App\Models\Album;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\StickerPack;
use App\Models\User;
use App\Services\Activities\CreateActivityCheckinSessionService;
use App\Services\Audit\AuditLogger;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeAuditUser(string $roleSlug): User
{
    $user = User::factory()->create();
    $role = Role::query()->where('slug', $roleSlug)->firstOrFail();
    $user->roles()->sync([$role->id]);

    return $user;
}

it('audit logger redacts sensitive metadata fields', function (): void {
    $admin = makeAuditUser('admin');

    app(AuditLogger::class)->log(
        action: 'audit.test_sensitive',
        actor: $admin,
        target: $admin,
        metadata: [
            'password' => 'plain-text',
            'remember_token' => 'remember-secret',
            'nested' => [
                'raw_token' => 'raw-123',
                'authorization' => 'Bearer xyz',
            ],
            'safe' => 'ok',
        ],
    );

    $log = AuditLog::query()->where('action', 'audit.test_sensitive')->latest('id')->firstOrFail();

    expect($log->metadata['password'])->toBe('[REDACTED]');
    expect($log->metadata['remember_token'])->toBe('[REDACTED]');
    expect($log->metadata['nested']['raw_token'])->toBe('[REDACTED]');
    expect($log->metadata['nested']['authorization'])->toBe('[REDACTED]');
    expect($log->metadata['safe'])->toBe('ok');
});

it('qr checkin raw token is not persisted in audit logs', function (): void {
    $admin = makeAuditUser('admin');
    $activity = Activity::query()->where('status', Activity::STATUS_OPEN)->firstOrFail();

    $created = app(CreateActivityCheckinSessionService::class)->create($activity, $admin, durationMinutes: 10, maxUses: 3);
    $rawToken = $created['raw_token'];

    $sessionCreatedLog = AuditLog::query()
        ->where('action', 'activity_checkin_session.created')
        ->where('entity_id', $created['session']->id)
        ->latest('id')
        ->firstOrFail();

    expect($sessionCreatedLog->metadata)->not->toHaveKey('raw_token');
    expect(json_encode($sessionCreatedLog->metadata, JSON_THROW_ON_ERROR))->not->toContain($rawToken);
});

it('permission denied audit keeps safe metadata', function (): void {
    $participant = makeAuditUser('participant');

    $this->actingAs($participant)->get('/admin/users')->assertForbidden();

    $log = AuditLog::query()
        ->where('action', 'permission.denied')
        ->where('actor_user_id', $participant->id)
        ->latest('id')
        ->firstOrFail();

    foreach (['permission', 'route_name', 'path'] as $requiredKey) {
        expect(array_key_exists($requiredKey, $log->metadata))->toBeTrue();
    }
    expect($log->metadata)->not->toHaveKey('password');
    expect($log->metadata)->not->toHaveKey('token');
});

it('pack opening audit stores delivered details without sensitive data', function (): void {
    $participant = makeAuditUser('participant');
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $pack = StickerPack::factory()->create([
        'user_id' => $participant->id,
        'album_id' => $album->id,
        'status' => StickerPack::STATUS_PENDING,
        'size' => 1,
    ]);

    $this->actingAs($participant)
        ->post("/packs/{$pack->id}/open")
        ->assertRedirect();

    $log = AuditLog::query()
        ->where('action', 'sticker_pack.opened')
        ->where('entity_id', $pack->id)
        ->latest('id')
        ->firstOrFail();

    foreach (['sticker_ids', 'delivered_count'] as $requiredKey) {
        expect(array_key_exists($requiredKey, $log->metadata))->toBeTrue();
    }
    expect($log->metadata)->not->toHaveKey('password');
    expect($log->metadata)->not->toHaveKey('raw_token');
});

it('reward code audit stores source context without secrets', function (): void {
    $participant = makeAuditUser('participant');

    $this->actingAs($participant)
        ->post('/reward-code', ['code' => 'MAHA10'])
        ->assertRedirect();

    $log = AuditLog::query()
        ->where('action', 'reward_code.redeemed')
        ->where('actor_user_id', $participant->id)
        ->latest('id')
        ->firstOrFail();

    foreach (['reward_code_id', 'reward_code', 'pack_ids'] as $requiredKey) {
        expect(array_key_exists($requiredKey, $log->metadata))->toBeTrue();
    }
    expect($log->metadata)->not->toHaveKey('token');
    expect($log->metadata)->not->toHaveKey('authorization');
});

it('self checkin audit never stores raw token', function (): void {
    $admin = makeAuditUser('admin');
    $participant = makeAuditUser('participant');
    $activity = Activity::query()->where('status', Activity::STATUS_OPEN)->firstOrFail();

    $created = app(CreateActivityCheckinSessionService::class)->create($activity, $admin, durationMinutes: 15, maxUses: 2);
    $rawToken = $created['raw_token'];

    $this->actingAs($participant)
        ->post("/checkin/{$rawToken}/confirm")
        ->assertRedirect();

    $checkin = ActivityCheckin::query()
        ->where('activity_id', $activity->id)
        ->where('user_id', $participant->id)
        ->firstOrFail();

    $log = AuditLog::query()
        ->where('action', 'activity_checkin.self_confirmed')
        ->where('entity_id', $checkin->id)
        ->latest('id')
        ->firstOrFail();

    expect($log->metadata)->not->toHaveKey('raw_token');
    expect(json_encode($log->metadata, JSON_THROW_ON_ERROR))->not->toContain($rawToken);
});
