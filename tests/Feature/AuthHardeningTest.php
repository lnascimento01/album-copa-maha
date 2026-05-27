<?php

declare(strict_types=1);

use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

it('pending user cannot access dashboard', function (): void {
    $pending = User::factory()->pendingApproval()->create();

    $this->actingAs($pending)
        ->get('/dashboard')
        ->assertRedirect(route('approval.pending', absolute: false));
});

it('rejected user cannot access dashboard', function (): void {
    $rejected = User::factory()->rejected()->create();

    $this->actingAs($rejected)
        ->get('/dashboard')
        ->assertRedirect(route('approval.rejected', absolute: false));
});

it('suspended user cannot access dashboard', function (): void {
    $suspended = User::factory()->suspended()->create();

    $this->actingAs($suspended)
        ->get('/dashboard')
        ->assertRedirect(route('approval.suspended', absolute: false));
});

it('logout works from approval state pages', function (): void {
    $pending = User::factory()->pendingApproval()->create();
    $rejected = User::factory()->rejected()->create();
    $suspended = User::factory()->suspended()->create();

    $this->actingAs($pending)->get('/approval/pending')->assertOk();
    $this->post('/logout')->assertRedirect(route('home', absolute: false));
    $this->assertGuest();

    $this->actingAs($rejected)->get('/approval/rejected')->assertOk();
    $this->post('/logout')->assertRedirect(route('home', absolute: false));
    $this->assertGuest();

    $this->actingAs($suspended)->get('/approval/suspended')->assertOk();
    $this->post('/logout')->assertRedirect(route('home', absolute: false));
    $this->assertGuest();
});

it('master seeded user remains approved with admin role', function (): void {
    $master = User::query()->where('email', 'lfsnascimento84@gmail.com')->firstOrFail();

    expect($master->approval_status)->toBe(User::APPROVAL_APPROVED);
    expect($master->approved_at)->not->toBeNull();
    expect($master->hasRole('admin'))->toBeTrue();
});

it('admin seeder does not overwrite existing master password', function (): void {
    User::query()->where('email', 'lfsnascimento84@gmail.com')->delete();
    $this->seed(RolePermissionSeeder::class);

    $master = User::query()->create([
        'name' => 'Leandro Nascimento',
        'email' => 'lfsnascimento84@gmail.com',
        'password' => Hash::make('senha-antiga-segura'),
        'approval_status' => User::APPROVAL_PENDING,
    ]);

    $this->seed(AdminUserSeeder::class);

    $master->refresh();

    expect(Hash::check('senha-antiga-segura', $master->password))->toBeTrue();
    expect($master->approval_status)->toBe(User::APPROVAL_APPROVED);
    expect($master->hasRole('admin'))->toBeTrue();
});
