<?php

use App\Models\Activity;
use App\Models\Album;
use App\Models\Role;
use App\Models\Team;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeActivityAdmin(): User
{
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    return $admin;
}

function makeActivityParticipant(): User
{
    $participant = User::factory()->create();
    $participant->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $participant;
}

it('admin accesses activities index and participant is forbidden', function (): void {
    $admin = makeActivityAdmin();
    $participant = makeActivityParticipant();

    $this->actingAs($admin)->get('/admin/activities')->assertOk();
    $this->actingAs($participant)->get('/admin/activities')->assertForbidden();
});

it('admin creates and updates draft activity with audit logs', function (): void {
    $admin = makeActivityAdmin();
    $team = Team::query()->where('slug', 'maha')->firstOrFail();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $this->actingAs($admin)->post('/admin/activities', [
        'team_id' => $team->id,
        'album_id' => $album->id,
        'title' => 'Treino de Sábado',
        'slug' => 'treino-sabado',
        'type' => Activity::TYPE_TRAINING,
        'description' => 'Sessão técnica',
        'starts_at' => now()->addDay()->toDateTimeString(),
        'ends_at' => now()->addDay()->addHour()->toDateTimeString(),
        'reward_pack_quantity' => 2,
        'reward_pack_size' => 3,
    ])->assertRedirect();

    $activity = Activity::query()->where('slug', 'treino-sabado')->firstOrFail();
    expect($activity->status)->toBe(Activity::STATUS_DRAFT);

    $this->actingAs($admin)->patch("/admin/activities/{$activity->id}", [
        'team_id' => $team->id,
        'album_id' => $album->id,
        'title' => 'Treino de Sábado Atualizado',
        'slug' => 'treino-sabado-atualizado',
        'type' => Activity::TYPE_EVENT,
        'description' => 'Sessão tática',
        'starts_at' => now()->addDays(2)->toDateTimeString(),
        'ends_at' => now()->addDays(2)->addHour()->toDateTimeString(),
        'reward_pack_quantity' => 1,
        'reward_pack_size' => 4,
    ])->assertRedirect();

    $this->assertDatabaseHas('audit_logs', ['action' => 'activity.created', 'entity_id' => $activity->id]);
    $this->assertDatabaseHas('audit_logs', ['action' => 'activity.updated', 'entity_id' => $activity->id]);
});

it('admin opens closes and cancels activities with audits', function (): void {
    $admin = makeActivityAdmin();
    $team = Team::query()->where('slug', 'maha')->firstOrFail();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $activity = Activity::factory()->create([
        'team_id' => $team->id,
        'album_id' => $album->id,
        'status' => Activity::STATUS_DRAFT,
    ]);

    $this->actingAs($admin)->patch("/admin/activities/{$activity->id}/open")->assertRedirect();
    $activity->refresh();
    expect($activity->status)->toBe(Activity::STATUS_OPEN);

    $this->actingAs($admin)->patch("/admin/activities/{$activity->id}/close")->assertRedirect();
    $activity->refresh();
    expect($activity->status)->toBe(Activity::STATUS_CLOSED);

    $draftToCancel = Activity::factory()->create([
        'team_id' => $team->id,
        'album_id' => $album->id,
        'status' => Activity::STATUS_DRAFT,
    ]);

    $this->actingAs($admin)->patch("/admin/activities/{$draftToCancel->id}/cancel", [
        'cancellation_reason' => 'Atividade cancelada',
    ])->assertRedirect();

    $this->assertDatabaseHas('audit_logs', ['action' => 'activity.opened', 'entity_id' => $activity->id]);
    $this->assertDatabaseHas('audit_logs', ['action' => 'activity.closed', 'entity_id' => $activity->id]);
    $this->assertDatabaseHas('audit_logs', ['action' => 'activity.cancelled', 'entity_id' => $draftToCancel->id]);
});

it('does not allow open activity when album is not active', function (): void {
    $admin = makeActivityAdmin();
    $team = Team::query()->where('slug', 'maha')->firstOrFail();
    $archivedAlbum = Album::factory()->archived()->create(['team_id' => $team->id]);

    $activity = Activity::factory()->create([
        'team_id' => $team->id,
        'album_id' => $archivedAlbum->id,
        'status' => Activity::STATUS_DRAFT,
    ]);

    $this->actingAs($admin)->patch("/admin/activities/{$activity->id}/open")
        ->assertSessionHasErrors('activity');

    $activity->refresh();
    expect($activity->status)->toBe(Activity::STATUS_DRAFT);
});
