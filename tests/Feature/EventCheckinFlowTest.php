<?php

use App\Models\Activity;
use App\Models\ActivityCheckin;
use App\Models\Album;
use App\Models\Role;
use App\Models\StickerPack;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeEventParticipant(bool $approved = true): User
{
    $user = $approved
        ? User::factory()->create()
        : User::factory()->pendingApproval()->create();

    $user->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $user;
}

function makeEventActivity(array $overrides = []): Activity
{
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    return Activity::factory()->open()->create([
        'team_id' => $album->team_id,
        'album_id' => $album->id,
        'type' => Activity::TYPE_EVENT,
        'title' => 'Evento Presencial MAHA',
        'starts_at' => now()->subMinutes(10),
        'ends_at' => now()->addMinutes(30),
        'location_name' => 'Ginásio MAHA',
        'latitude' => -23.55052,
        'longitude' => -46.633308,
        'radius_meters' => 200,
        'max_accuracy_meters' => 100,
        'event_timezone' => 'America/Sao_Paulo',
        'event_token' => 'evt_'.Str::lower(Str::random(24)),
        'reward_pack_quantity' => 1,
        'reward_pack_size' => 3,
        ...$overrides,
    ]);
}

it('approved participant confirms event checkin in radius and window and receives packs with audit', function (): void {
    $participant = makeEventParticipant();
    $event = makeEventActivity();

    $this->actingAs($participant)
        ->from("/checkin/event/{$event->event_token}")
        ->post("/checkin/event/{$event->event_token}/confirm", [
            'latitude' => -23.5505,
            'longitude' => -46.6333,
            'accuracy' => 25,
        ])
        ->assertRedirect("/checkin/event/{$event->event_token}");

    $checkin = ActivityCheckin::query()
        ->where('activity_id', $event->id)
        ->where('user_id', $participant->id)
        ->firstOrFail();

    expect($checkin->distance_meters)->toBeLessThanOrEqual(200);
    expect($checkin->accuracy_meters)->toBe(25);

    $packs = StickerPack::query()->where('activity_checkin_id', $checkin->id)->get();
    expect($packs)->toHaveCount(1);

    $this->actingAs($participant)
        ->get('/checkins')
        ->assertOk()
        ->assertSee('"source":"event"', false);

    $this->assertDatabaseHas('audit_logs', ['action' => 'event_checkin.created', 'entity_id' => $checkin->id]);
    $this->assertDatabaseHas('audit_logs', ['action' => 'event_checkin.package_granted', 'entity_id' => $checkin->id]);
});

it('participant cannot confirm twice for same event', function (): void {
    $participant = makeEventParticipant();
    $event = makeEventActivity();

    $payload = [
        'latitude' => -23.55052,
        'longitude' => -46.633308,
        'accuracy' => 20,
    ];

    $this->actingAs($participant)->post("/checkin/event/{$event->event_token}/confirm", $payload)->assertRedirect();

    $this->actingAs($participant)
        ->from("/checkin/event/{$event->event_token}")
        ->post("/checkin/event/{$event->event_token}/confirm", $payload)
        ->assertSessionHasErrors([
            'checkin' => 'Você já confirmou presença neste evento. O pacote já foi gerado na sua conta.',
        ]);

    expect(ActivityCheckin::query()->where('activity_id', $event->id)->where('user_id', $participant->id)->count())->toBe(1);
});

it('outside radius returns controlled error', function (): void {
    $participant = makeEventParticipant();
    $event = makeEventActivity();

    $this->actingAs($participant)
        ->from("/checkin/event/{$event->event_token}")
        ->post("/checkin/event/{$event->event_token}/confirm", [
            'latitude' => -23.5000,
            'longitude' => -46.6000,
            'accuracy' => 20,
        ])
        ->assertSessionHasErrors([
            'checkin' => 'Você está fora da área permitida para este check-in.',
        ]);
});

it('low location accuracy returns controlled error', function (): void {
    $participant = makeEventParticipant();
    $event = makeEventActivity(['max_accuracy_meters' => 50]);

    $this->actingAs($participant)
        ->from("/checkin/event/{$event->event_token}")
        ->post("/checkin/event/{$event->event_token}/confirm", [
            'latitude' => -23.55052,
            'longitude' => -46.633308,
            'accuracy' => 120,
        ])
        ->assertSessionHasErrors([
            'checkin' => 'Sua localização está imprecisa. Ative o GPS e tente novamente.',
        ]);
});

it('before start and after end return controlled errors', function (): void {
    $participant = makeEventParticipant();
    $futureEvent = makeEventActivity([
        'event_token' => 'evt_'.Str::lower(Str::random(24)),
        'starts_at' => now()->addMinutes(15),
        'ends_at' => now()->addMinutes(45),
    ]);

    $expiredEvent = makeEventActivity([
        'event_token' => 'evt_'.Str::lower(Str::random(24)),
        'starts_at' => now()->subHours(2),
        'ends_at' => now()->subMinute(),
    ]);

    $this->actingAs($participant)
        ->from("/checkin/event/{$futureEvent->event_token}")
        ->post("/checkin/event/{$futureEvent->event_token}/confirm", [
            'latitude' => -23.55052,
            'longitude' => -46.633308,
            'accuracy' => 20,
        ])
        ->assertSessionHasErrors([
            'checkin' => 'O check-in ainda não começou.',
        ]);

    $this->actingAs($participant)
        ->from("/checkin/event/{$expiredEvent->event_token}")
        ->post("/checkin/event/{$expiredEvent->event_token}/confirm", [
            'latitude' => -23.55052,
            'longitude' => -46.633308,
            'accuracy' => 20,
        ])
        ->assertSessionHasErrors([
            'checkin' => 'O período de check-in foi encerrado.',
        ]);
});

it('draft closed and cancelled events do not accept checkin', function (): void {
    $participant = makeEventParticipant();

    $draft = makeEventActivity([
        'event_token' => 'evt_'.Str::lower(Str::random(24)),
        'status' => Activity::STATUS_DRAFT,
        'opened_at' => null,
    ]);

    $closed = makeEventActivity([
        'event_token' => 'evt_'.Str::lower(Str::random(24)),
        'status' => Activity::STATUS_CLOSED,
        'closed_at' => now(),
    ]);

    $cancelled = makeEventActivity([
        'event_token' => 'evt_'.Str::lower(Str::random(24)),
        'status' => Activity::STATUS_CANCELLED,
        'cancelled_at' => now(),
        'cancellation_reason' => 'Cancelado no teste',
    ]);

    foreach ([$draft, $closed, $cancelled] as $event) {
        $this->actingAs($participant)
            ->from("/checkin/event/{$event->event_token}")
            ->post("/checkin/event/{$event->event_token}/confirm", [
                'latitude' => -23.55052,
                'longitude' => -46.633308,
                'accuracy' => 20,
            ])
            ->assertSessionHasErrors([
                'checkin' => 'Este check-in não está ativo.',
            ]);
    }
});

it('pending user cannot access event checkin flow', function (): void {
    $pending = makeEventParticipant(approved: false);
    $event = makeEventActivity();

    $this->actingAs($pending)
        ->post("/checkin/event/{$event->event_token}/confirm", [
            'latitude' => -23.55052,
            'longitude' => -46.633308,
            'accuracy' => 20,
        ])
        ->assertRedirect('/approval/pending');
});

it('invalid reward configuration is blocked', function (): void {
    $participant = makeEventParticipant();
    $event = makeEventActivity([
        'reward_pack_quantity' => 0,
    ]);

    $this->actingAs($participant)
        ->from("/checkin/event/{$event->event_token}")
        ->post("/checkin/event/{$event->event_token}/confirm", [
            'latitude' => -23.55052,
            'longitude' => -46.633308,
            'accuracy' => 20,
        ])
        ->assertSessionHasErrors([
            'checkin' => 'A recompensa deste evento não está configurada corretamente.',
        ]);
});

it('event checkin endpoint is rate limited', function (): void {
    $participant = makeEventParticipant();
    $event = makeEventActivity();

    for ($i = 0; $i < 8; $i++) {
        $this->actingAs($participant)
            ->post("/checkin/event/{$event->event_token}/confirm", [
                'latitude' => -23.5000,
                'longitude' => -46.6000,
                'accuracy' => 20,
            ]);
    }

    $this->actingAs($participant)
        ->post("/checkin/event/{$event->event_token}/confirm", [
            'latitude' => -23.5000,
            'longitude' => -46.6000,
            'accuracy' => 20,
        ])
        ->assertStatus(429);
});

it('activity checkins keep unique constraint by event and user', function (): void {
    $participant = makeEventParticipant();
    $event = makeEventActivity();

    ActivityCheckin::query()->create([
        'activity_id' => $event->id,
        'user_id' => $participant->id,
        'checked_by' => $participant->id,
        'status' => ActivityCheckin::STATUS_CONFIRMED,
        'checked_at' => now(),
    ]);

    expect(fn () => ActivityCheckin::query()->create([
        'activity_id' => $event->id,
        'user_id' => $participant->id,
        'checked_by' => $participant->id,
        'status' => ActivityCheckin::STATUS_CONFIRMED,
        'checked_at' => now(),
    ]))->toThrow(QueryException::class);
});
