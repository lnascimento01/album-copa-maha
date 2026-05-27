<?php

use App\Models\Player;
use App\Models\Role;
use App\Models\Team;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makePlayerAdmin(): User
{
    $admin = User::factory()->create();
    $role = Role::query()->where('slug', 'admin')->firstOrFail();
    $admin->roles()->sync([$role->id]);

    return $admin;
}

it('admin creates player', function (): void {
    $admin = makePlayerAdmin();
    $team = Team::factory()->create();

    $this->actingAs($admin)
        ->post('/admin/players', [
            'team_id' => $team->id,
            'name' => 'Novo Jogador',
            'type' => Player::TYPE_PLAYER,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('players', [
        'name' => 'Novo Jogador',
        'team_id' => $team->id,
    ]);
});

it('admin edits player', function (): void {
    $admin = makePlayerAdmin();
    $player = Player::factory()->create();

    $this->actingAs($admin)
        ->patch("/admin/players/{$player->id}", [
            'team_id' => $player->team_id,
            'name' => 'Jogador Ajustado',
            'type' => Player::TYPE_PLAYER,
        ])
        ->assertRedirect();

    $player->refresh();

    expect($player->name)->toBe('Jogador Ajustado');
});

it('participant cannot access players CRUD', function (): void {
    $participant = User::factory()->create();
    $participantRole = Role::query()->where('slug', 'participant')->firstOrFail();
    $participant->roles()->sync([$participantRole->id]);

    $this->actingAs($participant)->get('/admin/players')->assertForbidden();
});

it('creating player writes audit log', function (): void {
    $admin = makePlayerAdmin();
    $team = Team::factory()->create();

    $this->actingAs($admin)
        ->post('/admin/players', [
            'team_id' => $team->id,
            'name' => 'Jogador Audit',
            'type' => Player::TYPE_PLAYER,
        ])
        ->assertRedirect();

    $player = Player::query()->where('name', 'Jogador Audit')->firstOrFail();

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'player.created',
        'actor_user_id' => $admin->id,
        'entity_id' => $player->id,
    ]);
});

it('editing player writes audit log', function (): void {
    $admin = makePlayerAdmin();
    $player = Player::factory()->create();

    $this->actingAs($admin)
        ->patch("/admin/players/{$player->id}", [
            'team_id' => $player->team_id,
            'name' => 'Jogador Edit Audit',
            'type' => Player::TYPE_PLAYER,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'player.updated',
        'actor_user_id' => $admin->id,
        'entity_id' => $player->id,
    ]);
});
