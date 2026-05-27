<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(RolePermissionSeeder::class);
});

it('user can register', function (): void {
    $response = $this->post(route('register.store'), [
        'name' => 'Novo Participante',
        'email' => 'novo@maha.local',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('approval.pending', absolute: false));
    $this->assertAuthenticated();

    $this->get(route('dashboard'))
        ->assertRedirect(route('approval.pending', absolute: false));

    $this->assertDatabaseHas('users', [
        'email' => 'novo@maha.local',
    ]);
});

it('registration creates user with pending status', function (): void {
    $this->post(route('register.store'), [
        'name' => 'Pendente',
        'email' => 'pending@maha.local',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertDatabaseHas('users', [
        'email' => 'pending@maha.local',
        'approval_status' => User::APPROVAL_PENDING,
    ]);
});

it('pending user cannot access dashboard', function (): void {
    $user = User::factory()->pendingApproval()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('approval.pending', absolute: false));
});

it('approved user can access dashboard', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk();
});

it('rejected user sees rejected screen', function (): void {
    $user = User::factory()->rejected()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('approval.rejected', absolute: false));

    $this->actingAs($user)
        ->get(route('approval.rejected'))
        ->assertOk()
        ->assertSee('"component":"approval\\/rejected"', false);
});

it('suspended user does not access dashboard and sees suspended screen', function (): void {
    $user = User::factory()->suspended()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('approval.suspended', absolute: false));

    $this->actingAs($user)
        ->get(route('approval.suspended'))
        ->assertOk()
        ->assertSee('"component":"approval\\/suspended"', false);
});

it('login registers last login fields', function (): void {
    $user = User::factory()->create([
        'email' => 'login@maha.local',
        'password' => 'password',
    ]);

    $this->post(route('login.store'), [
        'email' => 'login@maha.local',
        'password' => 'password',
    ])->assertRedirect(route('dashboard', absolute: false));

    $user->refresh();

    expect($user->last_login_at)->not->toBeNull();
    expect($user->last_login_ip)->not->toBeNull();

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'user.login',
        'actor_user_id' => $user->id,
    ]);
});
