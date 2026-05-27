<?php

use App\Models\Album;
use App\Models\RewardCode;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeRewardAdmin(): User
{
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    return $admin;
}

function makeRewardParticipant(): User
{
    $user = User::factory()->create();
    $user->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $user;
}

it('admin accesses reward code admin pages and participant cannot', function (): void {
    $admin = makeRewardAdmin();
    $participant = makeRewardParticipant();

    $this->actingAs($admin)->get('/admin/reward-codes')->assertOk();
    $this->actingAs($participant)->get('/admin/reward-codes')->assertForbidden();
});

it('admin creates and edits reward code draft with normalized code', function (): void {
    $admin = makeRewardAdmin();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $this->actingAs($admin)->post('/admin/reward-codes', [
        'album_id' => $album->id,
        'team_id' => $album->team_id,
        'code' => '  maha-story-01 ',
        'title' => 'Código Story 01',
        'description' => 'Campanha da semana',
        'status' => 'draft',
        'source_channel' => 'instagram',
        'reward_pack_quantity' => 1,
        'reward_pack_size' => 3,
        'starts_at' => now()->subMinute()->toDateTimeString(),
        'expires_at' => now()->addDay()->toDateTimeString(),
        'max_total_redemptions' => 100,
        'max_redemptions_per_user' => 1,
    ])->assertRedirect();

    $rewardCode = RewardCode::query()->where('title', 'Código Story 01')->firstOrFail();

    expect($rewardCode->code)->toBe('MAHA-STORY-01');
    expect($rewardCode->status)->toBe(RewardCode::STATUS_DRAFT);

    $this->actingAs($admin)->patch("/admin/reward-codes/{$rewardCode->id}", [
        'album_id' => $album->id,
        'team_id' => $album->team_id,
        'code' => 'MAHA-STORY-01',
        'title' => 'Código Story 01 Atualizado',
        'description' => 'Atualizado',
        'status' => 'draft',
        'source_channel' => 'event',
        'reward_pack_quantity' => 2,
        'reward_pack_size' => 4,
        'starts_at' => now()->subMinute()->toDateTimeString(),
        'expires_at' => now()->addDays(2)->toDateTimeString(),
        'max_total_redemptions' => 200,
        'max_redemptions_per_user' => 2,
    ])->assertRedirect();

    $rewardCode->refresh();

    expect($rewardCode->title)->toBe('Código Story 01 Atualizado');
    expect($rewardCode->source_channel)->toBe('event');
    expect($rewardCode->reward_pack_quantity)->toBe(2);

    $this->assertDatabaseHas('audit_logs', ['action' => 'reward_code.created', 'entity_id' => $rewardCode->id]);
    $this->assertDatabaseHas('audit_logs', ['action' => 'reward_code.updated', 'entity_id' => $rewardCode->id]);
});

it('admin activates and revokes reward code with audit', function (): void {
    $admin = makeRewardAdmin();
    $code = RewardCode::factory()->create([
        'status' => RewardCode::STATUS_DRAFT,
        'album_id' => Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail()->id,
    ]);

    $this->actingAs($admin)->patch("/admin/reward-codes/{$code->id}/activate")
        ->assertRedirect();

    $code->refresh();
    expect($code->status)->toBe(RewardCode::STATUS_ACTIVE);

    $this->actingAs($admin)->patch("/admin/reward-codes/{$code->id}/revoke", [
        'revoke_reason' => 'Campanha encerrada',
    ])->assertRedirect();

    $code->refresh();
    expect($code->status)->toBe(RewardCode::STATUS_REVOKED);

    $this->assertDatabaseHas('audit_logs', ['action' => 'reward_code.activated', 'entity_id' => $code->id]);
    $this->assertDatabaseHas('audit_logs', ['action' => 'reward_code.revoked', 'entity_id' => $code->id]);
});

it('does not allow duplicate reward code', function (): void {
    $admin = makeRewardAdmin();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    RewardCode::factory()->create([
        'code' => 'DUPLICATE-CODE',
        'team_id' => $album->team_id,
        'album_id' => $album->id,
    ]);

    $this->actingAs($admin)->post('/admin/reward-codes', [
        'album_id' => $album->id,
        'team_id' => $album->team_id,
        'code' => ' duplicate-code ',
        'title' => 'Duplicado',
        'status' => 'draft',
        'source_channel' => 'instagram',
        'reward_pack_quantity' => 1,
        'reward_pack_size' => 3,
        'max_redemptions_per_user' => 1,
    ])->assertSessionHasErrors('code');
});
