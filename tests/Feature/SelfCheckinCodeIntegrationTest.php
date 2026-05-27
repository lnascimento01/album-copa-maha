<?php

use App\Models\Activity;
use App\Models\ActivityCheckin;
use App\Models\ActivityCheckinSession;
use App\Models\Album;
use App\Models\Role;
use App\Models\StickerPack;
use App\Models\User;
use App\Models\UserSticker;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeCodeAdmin(): User
{
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    return $admin;
}

function makeCodeParticipant(): User
{
    $user = User::factory()->create();
    $user->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $user;
}

/**
 * @return array{session: ActivityCheckinSession, raw_token: string}
 */
function makeCodeSession(): array
{
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $activity = Activity::factory()->open()->create([
        'team_id' => $album->team_id,
        'album_id' => $album->id,
        'reward_pack_quantity' => 1,
        'reward_pack_size' => 1,
    ]);

    $rawToken = Str::random(64);
    $session = ActivityCheckinSession::factory()->create([
        'activity_id' => $activity->id,
        'token_hash' => hash_hmac('sha256', $rawToken, (string) config('app.key')),
        'public_code' => 'MAHA-ABC12',
        'status' => ActivityCheckinSession::STATUS_ACTIVE,
        'expires_at' => now()->addMinutes(30),
    ]);

    return ['session' => $session, 'raw_token' => $rawToken];
}

it('self checkin by manual short code works and invalid code is blocked', function (): void {
    $participant = makeCodeParticipant();
    makeCodeSession();

    $this->actingAs($participant)->get('/checkin-code')->assertOk();

    $this->actingAs($participant)->post('/checkin-code', [
        'code' => 'maha-abc12',
    ])->assertRedirect();

    $checkin = ActivityCheckin::query()->where('user_id', $participant->id)->firstOrFail();
    expect($checkin->metadata['self_checkin'] ?? false)->toBeTrue();

    $this->actingAs($participant)
        ->from('/checkin-code')
        ->post('/checkin-code', ['code' => 'INVALID'])
        ->assertSessionHasErrors('code');
});

it('qr self checkin generated pack appears in packs and can be opened and reflected in album/checkins', function (): void {
    $participant = makeCodeParticipant();
    $sessionData = makeCodeSession();
    $rawToken = $sessionData['raw_token'];

    $this->actingAs($participant)->post("/checkin/{$rawToken}/confirm")->assertRedirect();

    $pack = StickerPack::query()->where('user_id', $participant->id)->where('source', StickerPack::SOURCE_CHECKIN)->latest('id')->firstOrFail();

    $this->actingAs($participant)->get('/packs')->assertOk()->assertSee('"source":"checkin"', false);

    $this->actingAs($participant)->post("/packs/{$pack->id}/open")->assertRedirect();

    $pack->refresh();
    expect($pack->status)->toBe(StickerPack::STATUS_OPENED);

    $unlockedStickerId = UserSticker::query()->where('source', 'pack')->where('source_id', $pack->id)->value('sticker_id');
    expect($unlockedStickerId)->not->toBeNull();

    $this->actingAs($participant)->get('/album')->assertOk()->assertSee('"is_unlocked":true', false);
    $this->actingAs($participant)->get("/album/stickers/{$unlockedStickerId}")->assertOk()->assertSee('"is_full_visible":true', false);
    $this->actingAs($participant)->get('/checkins')->assertOk()->assertSee('"source":"self"', false);
});

it('admin sees checkin source in sticker pack detail and audit logs', function (): void {
    $admin = makeCodeAdmin();
    $participant = makeCodeParticipant();
    $sessionData = makeCodeSession();
    $rawToken = $sessionData['raw_token'];

    $this->actingAs($participant)->post("/checkin/{$rawToken}/confirm")->assertRedirect();

    $pack = StickerPack::query()->where('user_id', $participant->id)->where('source', StickerPack::SOURCE_CHECKIN)->latest('id')->firstOrFail();

    $this->actingAs($admin)->get("/admin/sticker-packs/{$pack->id}")->assertOk()->assertSee('"source":"checkin"', false);

    $auditResponse = $this->actingAs($admin)->get('/admin/audit-logs')->assertOk();
    $auditResponse->assertSee('activity_checkin.self_confirmed');
});
