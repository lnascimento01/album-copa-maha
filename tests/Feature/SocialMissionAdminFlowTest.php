<?php

use App\Models\Album;
use App\Models\Role;
use App\Models\SocialMission;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeSocialAdmin(): User
{
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    return $admin;
}

function makeSocialParticipant(): User
{
    $user = User::factory()->create();
    $user->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $user;
}

it('admin accesses social mission admin and participant cannot', function (): void {
    $admin = makeSocialAdmin();
    $participant = makeSocialParticipant();

    $this->actingAs($admin)->get('/admin/social-missions')->assertOk();
    $this->actingAs($participant)->get('/admin/social-missions')->assertForbidden();
});

it('admin creates edits activates closes and cancels missions with audit', function (): void {
    $admin = makeSocialAdmin();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $this->actingAs($admin)->post('/admin/social-missions', [
        'team_id' => $album->team_id,
        'album_id' => $album->id,
        'title' => 'Missão Extra Semana 1',
        'slug' => 'missao-extra-semana-1',
        'description' => 'Descrição',
        'instructions' => 'Instruções',
        'status' => 'draft',
        'type' => 'instagram_story',
        'validation_mode' => 'manual',
        'reward_pack_quantity' => 1,
        'reward_pack_size' => 3,
        'starts_at' => now()->subHour()->toDateTimeString(),
        'ends_at' => now()->addDay()->toDateTimeString(),
        'max_submissions_total' => 100,
        'max_submissions_per_user' => 1,
    ])->assertRedirect();

    $mission = SocialMission::query()->where('slug', 'missao-extra-semana-1')->firstOrFail();

    expect($mission->status)->toBe(SocialMission::STATUS_DRAFT);

    $this->actingAs($admin)->patch("/admin/social-missions/{$mission->id}", [
        'team_id' => $album->team_id,
        'album_id' => $album->id,
        'title' => 'Missão Extra Semana 1 Atualizada',
        'slug' => 'missao-extra-semana-1',
        'description' => 'Descrição atualizada',
        'instructions' => 'Instruções atualizadas',
        'status' => 'draft',
        'type' => 'instagram_post',
        'validation_mode' => 'manual',
        'reward_pack_quantity' => 2,
        'reward_pack_size' => 4,
        'starts_at' => now()->subHour()->toDateTimeString(),
        'ends_at' => now()->addDay()->toDateTimeString(),
        'max_submissions_total' => 200,
        'max_submissions_per_user' => 2,
    ])->assertRedirect();

    $mission->refresh();
    expect($mission->title)->toBe('Missão Extra Semana 1 Atualizada');

    $this->actingAs($admin)->patch("/admin/social-missions/{$mission->id}/activate")->assertRedirect();
    $mission->refresh();
    expect($mission->status)->toBe(SocialMission::STATUS_ACTIVE);

    $this->actingAs($admin)->patch("/admin/social-missions/{$mission->id}/close")->assertRedirect();
    $mission->refresh();
    expect($mission->status)->toBe(SocialMission::STATUS_CLOSED);

    $mission->forceFill(['status' => SocialMission::STATUS_DRAFT])->save();

    $this->actingAs($admin)->patch("/admin/social-missions/{$mission->id}/cancel", [
        'cancellation_reason' => 'Ação encerrada',
    ])->assertRedirect();

    $mission->refresh();
    expect($mission->status)->toBe(SocialMission::STATUS_CANCELLED);

    $this->assertDatabaseHas('audit_logs', ['action' => 'social_mission.created', 'entity_id' => $mission->id]);
    $this->assertDatabaseHas('audit_logs', ['action' => 'social_mission.updated', 'entity_id' => $mission->id]);
    $this->assertDatabaseHas('audit_logs', ['action' => 'social_mission.activated', 'entity_id' => $mission->id]);
    $this->assertDatabaseHas('audit_logs', ['action' => 'social_mission.closed', 'entity_id' => $mission->id]);
    $this->assertDatabaseHas('audit_logs', ['action' => 'social_mission.cancelled', 'entity_id' => $mission->id]);
});

it('does not allow activate mission when album is not active', function (): void {
    $admin = makeSocialAdmin();
    $album = Album::factory()->archived()->create();

    $mission = SocialMission::factory()->create([
        'team_id' => $album->team_id,
        'album_id' => $album->id,
        'status' => SocialMission::STATUS_DRAFT,
    ]);

    $this->actingAs($admin)->patch("/admin/social-missions/{$mission->id}/activate")
        ->assertSessionHasErrors('mission');
});
