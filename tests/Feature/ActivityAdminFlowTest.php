<?php

use App\Models\Activity;
use App\Models\Album;
use App\Models\Role;
use App\Models\Team;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

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
        'location_name' => 'Centro Esportivo MAHA',
        'latitude' => -23.55052,
        'longitude' => -46.633308,
        'radius_meters' => 200,
        'max_accuracy_meters' => 100,
        'event_timezone' => 'America/Sao_Paulo',
        'starts_at' => now()->addDays(2)->toDateTimeString(),
        'ends_at' => now()->addDays(2)->addHour()->toDateTimeString(),
        'reward_pack_quantity' => 1,
        'reward_pack_size' => 4,
    ])->assertRedirect();

    $activity->refresh();
    expect($activity->type)->toBe(Activity::TYPE_EVENT);
    expect($activity->event_token)->not->toBeNull();
    expect($activity->location_name)->toBe('Centro Esportivo MAHA');
    expect($activity->latitude)->toBe(-23.55052);
    expect($activity->longitude)->toBe(-46.633308);
    expect($activity->radius_meters)->toBe(200);
    expect($activity->max_accuracy_meters)->toBe(100);
    expect($activity->event_timezone)->toBe('America/Sao_Paulo');

    $this->actingAs($admin)
        ->get("/admin/activities/{$activity->id}")
        ->assertOk()
        ->assertSee('checkin\\/event\\/', false);

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

it('common activity accepts ends_at equal starts_at and does not require event fields', function (): void {
    $admin = makeActivityAdmin();
    $team = Team::query()->where('slug', 'maha')->firstOrFail();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $sameTime = now()->addDay()->toDateTimeString();

    $this->actingAs($admin)->post('/admin/activities', [
        'team_id' => $team->id,
        'album_id' => $album->id,
        'title' => 'Atividade Comum Mesma Janela',
        'slug' => 'atividade-comum-mesma-janela',
        'type' => Activity::TYPE_TRAINING,
        'description' => 'Sem campos de evento',
        'starts_at' => $sameTime,
        'ends_at' => $sameTime,
        'reward_pack_quantity' => 1,
        'reward_pack_size' => 3,
    ])->assertRedirect();

    $activity = Activity::query()->where('slug', 'atividade-comum-mesma-janela')->firstOrFail();
    expect(optional($activity->starts_at)?->toDateTimeString())->toBe(optional($activity->ends_at)?->toDateTimeString());
    expect($activity->location_name)->toBeNull();
    expect($activity->latitude)->toBeNull();
    expect($activity->longitude)->toBeNull();
    expect($activity->event_token)->toBeNull();
});

it('event activity requires ends_at strictly after starts_at and accepts valid window', function (): void {
    $admin = makeActivityAdmin();
    $team = Team::query()->where('slug', 'maha')->firstOrFail();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $sameTime = now()->addDays(2)->toDateTimeString();

    $this->actingAs($admin)
        ->from('/admin/activities/create')
        ->post('/admin/activities', [
            'team_id' => $team->id,
            'album_id' => $album->id,
            'title' => 'Evento Janela Inválida',
            'slug' => 'evento-janela-invalida',
            'type' => Activity::TYPE_EVENT,
            'description' => 'Evento com janela inválida',
            'location_name' => 'Centro MAHA',
            'latitude' => -23.55052,
            'longitude' => -46.633308,
            'radius_meters' => 200,
            'max_accuracy_meters' => 100,
            'event_timezone' => 'America/Sao_Paulo',
            'starts_at' => $sameTime,
            'ends_at' => $sameTime,
            'reward_pack_quantity' => 1,
            'reward_pack_size' => 3,
        ])
        ->assertSessionHasErrors('ends_at');

    $startsAt = now()->addDays(3);

    $this->actingAs($admin)->post('/admin/activities', [
        'team_id' => $team->id,
        'album_id' => $album->id,
        'title' => 'Evento Janela Válida',
        'slug' => 'evento-janela-valida',
        'type' => Activity::TYPE_EVENT,
        'description' => 'Evento com janela válida',
        'location_name' => 'Centro MAHA',
        'latitude' => -23.55052,
        'longitude' => -46.633308,
        'radius_meters' => 200,
        'max_accuracy_meters' => 100,
        'event_timezone' => 'America/Sao_Paulo',
        'starts_at' => $startsAt->toDateTimeString(),
        'ends_at' => $startsAt->copy()->addHour()->toDateTimeString(),
        'reward_pack_quantity' => 1,
        'reward_pack_size' => 3,
    ])->assertRedirect();

    $event = Activity::query()->where('slug', 'evento-janela-valida')->firstOrFail();
    expect($event->type)->toBe(Activity::TYPE_EVENT);
    expect($event->ends_at?->isAfter($event->starts_at))->toBeTrue();
});

it('admin updates event geolocation fields and persists changes', function (): void {
    $admin = makeActivityAdmin();
    $team = Team::query()->where('slug', 'maha')->firstOrFail();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $startsAt = now()->addDays(2);

    $activity = Activity::factory()->create([
        'team_id' => $team->id,
        'album_id' => $album->id,
        'type' => Activity::TYPE_EVENT,
        'status' => Activity::STATUS_DRAFT,
        'location_name' => 'Ginásio A',
        'latitude' => -25.4284,
        'longitude' => -49.2733,
        'radius_meters' => 150,
        'max_accuracy_meters' => 100,
        'event_timezone' => 'America/Sao_Paulo',
        'starts_at' => $startsAt,
        'ends_at' => $startsAt->copy()->addHour(),
    ]);

    $this->actingAs($admin)->patch("/admin/activities/{$activity->id}", [
        'team_id' => $team->id,
        'album_id' => $album->id,
        'title' => $activity->title,
        'slug' => $activity->slug,
        'type' => Activity::TYPE_EVENT,
        'description' => 'Evento atualizado',
        'location_name' => 'Ginásio AAPH',
        'latitude' => -25.4301,
        'longitude' => -49.2712,
        'radius_meters' => 220,
        'max_accuracy_meters' => 80,
        'event_timezone' => 'America/Sao_Paulo',
        'starts_at' => $startsAt->copy()->addDay()->toDateTimeString(),
        'ends_at' => $startsAt->copy()->addDay()->addHours(2)->toDateTimeString(),
        'reward_pack_quantity' => 1,
        'reward_pack_size' => 3,
    ])->assertRedirect();

    $activity->refresh();
    expect($activity->location_name)->toBe('Ginásio AAPH');
    expect($activity->latitude)->toBe(-25.4301);
    expect($activity->longitude)->toBe(-49.2712);
    expect($activity->radius_meters)->toBe(220);
    expect($activity->max_accuracy_meters)->toBe(80);
});

it('event activity rejects missing required geolocation fields', function (): void {
    $admin = makeActivityAdmin();
    $team = Team::query()->where('slug', 'maha')->firstOrFail();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $startsAt = now()->addDay();

    $this->actingAs($admin)
        ->from('/admin/activities/create')
        ->post('/admin/activities', [
            'team_id' => $team->id,
            'album_id' => $album->id,
            'title' => 'Evento sem geolocalização',
            'slug' => 'evento-sem-geolocalizacao',
            'type' => Activity::TYPE_EVENT,
            'description' => 'Evento inválido',
            'starts_at' => $startsAt->toDateTimeString(),
            'ends_at' => $startsAt->copy()->addHour()->toDateTimeString(),
            'reward_pack_quantity' => 1,
            'reward_pack_size' => 3,
        ])
        ->assertSessionHasErrors(['location_name', 'latitude']);
});

it('event stores checkin window using event timezone baseline', function (): void {
    $admin = makeActivityAdmin();
    $team = Team::query()->where('slug', 'maha')->firstOrFail();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $startsLocal = '2026-05-28 22:00:00';
    $endsLocal = '2026-05-28 23:00:00';

    $this->actingAs($admin)->post('/admin/activities', [
        'team_id' => $team->id,
        'album_id' => $album->id,
        'title' => 'Evento Fuso Consistente',
        'slug' => 'evento-fuso-consistente',
        'type' => Activity::TYPE_EVENT,
        'description' => 'Valida conversão para UTC',
        'location_name' => 'Ginásio AAPH',
        'latitude' => -25.4284,
        'longitude' => -49.2733,
        'radius_meters' => 150,
        'max_accuracy_meters' => 100,
        'event_timezone' => 'America/Sao_Paulo',
        'starts_at' => $startsLocal,
        'ends_at' => $endsLocal,
        'reward_pack_quantity' => 1,
        'reward_pack_size' => 3,
    ])->assertRedirect();

    $activity = Activity::query()->where('slug', 'evento-fuso-consistente')->firstOrFail();
    $expectedStartsUtc = Carbon::parse($startsLocal, 'America/Sao_Paulo')->utc()->toDateTimeString();
    $expectedEndsUtc = Carbon::parse($endsLocal, 'America/Sao_Paulo')->utc()->toDateTimeString();

    expect($activity->starts_at?->toDateTimeString())->toBe($expectedStartsUtc);
    expect($activity->ends_at?->toDateTimeString())->toBe($expectedEndsUtc);
});

it('admin can edit open event activity', function (): void {
    $admin = makeActivityAdmin();
    $team = Team::query()->where('slug', 'maha')->firstOrFail();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $activity = Activity::factory()->open()->create([
        'team_id' => $team->id,
        'album_id' => $album->id,
        'type' => Activity::TYPE_EVENT,
        'location_name' => 'Ginásio A',
        'latitude' => -25.4284,
        'longitude' => -49.2733,
        'radius_meters' => 150,
        'max_accuracy_meters' => 100,
        'event_timezone' => 'America/Sao_Paulo',
        'starts_at' => now()->addHour(),
        'ends_at' => now()->addHours(2),
    ]);

    $this->actingAs($admin)
        ->get("/admin/activities/{$activity->id}/edit")
        ->assertOk();

    $this->actingAs($admin)
        ->patch("/admin/activities/{$activity->id}", [
            'team_id' => $team->id,
            'album_id' => $album->id,
            'title' => $activity->title,
            'slug' => $activity->slug,
            'type' => Activity::TYPE_EVENT,
            'description' => 'Evento aberto editado',
            'location_name' => 'Ginásio AAPH',
            'latitude' => -25.4301,
            'longitude' => -49.2712,
            'radius_meters' => 220,
            'max_accuracy_meters' => 80,
            'event_timezone' => 'America/Sao_Paulo',
            'starts_at' => '2026-05-28 22:00:00',
            'ends_at' => '2026-05-28 23:00:00',
            'reward_pack_quantity' => 1,
            'reward_pack_size' => 3,
        ])
        ->assertRedirect();

    $activity->refresh();
    expect($activity->location_name)->toBe('Ginásio AAPH');
    expect($activity->radius_meters)->toBe(220);
});
