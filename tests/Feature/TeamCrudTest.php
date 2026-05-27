<?php

use App\Models\Role;
use App\Models\Team;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeTeamAdmin(): User
{
    $admin = User::factory()->create();
    $adminRole = Role::query()->where('slug', 'admin')->firstOrFail();
    $admin->roles()->sync([$adminRole->id]);

    return $admin;
}

it('admin creates team', function (): void {
    $admin = makeTeamAdmin();

    $this->actingAs($admin)
        ->post('/admin/teams', [
            'name' => 'Time Beta',
            'slug' => 'time-beta',
            'short_name' => 'TB',
            'is_active' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('teams', [
        'slug' => 'time-beta',
    ]);
});

it('admin edits team', function (): void {
    $admin = makeTeamAdmin();
    $team = Team::factory()->create();

    $this->actingAs($admin)
        ->patch("/admin/teams/{$team->id}", [
            'name' => 'Nome Ajustado',
            'slug' => 'nome-ajustado',
            'short_name' => 'NA',
            'is_active' => true,
        ])
        ->assertRedirect();

    $team->refresh();

    expect($team->name)->toBe('Nome Ajustado');
    expect($team->slug)->toBe('nome-ajustado');
});

it('creating team writes team created audit log', function (): void {
    $admin = makeTeamAdmin();

    $this->actingAs($admin)
        ->post('/admin/teams', [
            'name' => 'Time Audit',
            'slug' => 'time-audit',
            'short_name' => 'TA',
            'is_active' => true,
        ])
        ->assertRedirect();

    $team = Team::query()->where('slug', 'time-audit')->firstOrFail();

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'team.created',
        'actor_user_id' => $admin->id,
        'entity_id' => $team->id,
    ]);
});

it('editing team writes team updated audit log', function (): void {
    $admin = makeTeamAdmin();
    $team = Team::factory()->create();

    $this->actingAs($admin)
        ->patch("/admin/teams/{$team->id}", [
            'name' => 'Time Editado',
            'slug' => 'time-editado',
            'short_name' => 'TE',
            'is_active' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'team.updated',
        'actor_user_id' => $admin->id,
        'entity_id' => $team->id,
    ]);
});
