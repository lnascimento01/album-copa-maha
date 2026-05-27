<?php

use App\Models\Album;
use App\Models\RewardCode;
use App\Models\RewardCodeRedemption;
use App\Models\Role;
use App\Models\StickerPack;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeRedeemParticipant(): User
{
    $user = User::factory()->create();
    $user->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $user;
}

it('approved participant redeems active code and generates packs with audit', function (): void {
    $participant = makeRedeemParticipant();
    $code = RewardCode::query()->where('code', 'MAHA10')->firstOrFail();

    $beforeCount = $code->redeemed_count;

    $this->actingAs($participant)->post('/reward-code', [
        'code' => ' maha10 ',
    ])->assertRedirect('/reward-code');

    $redemption = RewardCodeRedemption::query()
        ->where('reward_code_id', $code->id)
        ->where('user_id', $participant->id)
        ->firstOrFail();

    $packs = StickerPack::query()->where('reward_code_redemption_id', $redemption->id)->get();

    expect($packs->count())->toBe($code->reward_pack_quantity);
    expect($packs->pluck('source')->unique()->values()->all())->toBe([StickerPack::SOURCE_REWARD_CODE]);

    $code->refresh();
    expect($code->redeemed_count)->toBe($beforeCount + 1);

    $this->assertDatabaseHas('audit_logs', ['action' => 'reward_code.redeemed', 'entity_id' => $redemption->id]);
    $this->assertDatabaseHas('audit_logs', ['action' => 'sticker_pack.granted_by_reward_code', 'entity_id' => $redemption->id]);
});

it('pending user cannot redeem code', function (): void {
    $pending = User::factory()->pendingApproval()->create();
    $pending->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    $this->actingAs($pending)->post('/reward-code', [
        'code' => 'MAHA10',
    ])->assertRedirect('/approval/pending');
});

it('does not redeem for draft revoked expired or not started codes', function (): void {
    $participant = makeRedeemParticipant();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $draft = RewardCode::factory()->create([
        'team_id' => $album->team_id,
        'album_id' => $album->id,
        'code' => 'DRAFT-01',
        'status' => RewardCode::STATUS_DRAFT,
    ]);

    $revoked = RewardCode::factory()->revoked()->create([
        'team_id' => $album->team_id,
        'album_id' => $album->id,
        'code' => 'REVK-01',
    ]);

    $expired = RewardCode::factory()->active()->create([
        'team_id' => $album->team_id,
        'album_id' => $album->id,
        'code' => 'EXPR-01',
        'expires_at' => now()->subMinute(),
    ]);

    $notStarted = RewardCode::factory()->active()->create([
        'team_id' => $album->team_id,
        'album_id' => $album->id,
        'code' => 'FUTR-01',
        'starts_at' => now()->addHour(),
    ]);

    foreach ([$draft, $revoked, $expired, $notStarted] as $code) {
        $this->actingAs($participant)
            ->from('/reward-code')
            ->post('/reward-code', ['code' => $code->code])
            ->assertSessionHasErrors('code');
    }

    $this->assertDatabaseCount('reward_code_redemptions', 0);
});

it('respects max total and max per user limits', function (): void {
    $userA = makeRedeemParticipant();
    $userB = makeRedeemParticipant();

    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $code = RewardCode::factory()->active()->create([
        'team_id' => $album->team_id,
        'album_id' => $album->id,
        'code' => 'LIMIT-01',
        'max_total_redemptions' => 1,
        'max_redemptions_per_user' => 1,
    ]);

    $this->actingAs($userA)->post('/reward-code', ['code' => 'LIMIT-01'])->assertRedirect();

    $this->actingAs($userB)
        ->from('/reward-code')
        ->post('/reward-code', ['code' => 'LIMIT-01'])
        ->assertSessionHasErrors('code');

    $perUserCode = RewardCode::factory()->active()->create([
        'team_id' => $album->team_id,
        'album_id' => $album->id,
        'code' => 'LIMIT-02',
        'max_total_redemptions' => 10,
        'max_redemptions_per_user' => 1,
    ]);

    $this->actingAs($userA)->post('/reward-code', ['code' => 'LIMIT-02'])->assertRedirect();

    $this->actingAs($userA)
        ->from('/reward-code')
        ->post('/reward-code', ['code' => 'LIMIT-02'])
        ->assertSessionHasErrors('code');

    expect(RewardCodeRedemption::query()->where('reward_code_id', $perUserCode->id)->where('user_id', $userA->id)->count())->toBe(1);
});

it('invalid code returns controlled message audits denied and creates no pack', function (): void {
    $participant = makeRedeemParticipant();

    $this->actingAs($participant)
        ->from('/reward-code')
        ->post('/reward-code', ['code' => 'INVALID-999'])
        ->assertSessionHasErrors('code');

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'reward_code.redeem_denied',
        'actor_user_id' => $participant->id,
    ]);

    $this->assertDatabaseCount('reward_code_redemptions', 0);
    expect(StickerPack::query()->where('source', StickerPack::SOURCE_REWARD_CODE)->count())->toBe(0);
});

it('participant sees only own redemption history', function (): void {
    $userA = makeRedeemParticipant();
    $userB = makeRedeemParticipant();

    $code = RewardCode::query()->where('code', 'MAHA10')->firstOrFail();

    RewardCodeRedemption::factory()->create([
        'reward_code_id' => $code->id,
        'user_id' => $userA->id,
    ]);

    RewardCodeRedemption::factory()->create([
        'reward_code_id' => $code->id,
        'user_id' => $userB->id,
    ]);

    $this->actingAs($userA)->get('/reward-codes/history')
        ->assertOk()
        ->assertSee($code->code)
        ->assertDontSee($userB->email);
});
