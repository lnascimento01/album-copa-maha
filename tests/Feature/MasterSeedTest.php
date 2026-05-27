<?php

declare(strict_types=1);

use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

it('migrate fresh with seed creates master user', function (): void {
    $this->artisan('migrate:fresh', ['--seed' => true])->assertSuccessful();

    $master = User::query()->where('email', 'lfsnascimento84@gmail.com')->first();

    expect($master)->not->toBeNull();
});

it('master user is approved and has admin role with effective permissions', function (): void {
    $this->seed(DatabaseSeeder::class);

    $master = User::query()->where('email', 'lfsnascimento84@gmail.com')->firstOrFail();

    expect($master->approval_status)->toBe(User::APPROVAL_APPROVED);
    expect($master->approved_at)->not->toBeNull();
    expect($master->email_verified_at)->not->toBeNull();
    expect($master->hasRole('admin'))->toBeTrue();
    expect($master->hasPermission('users.viewAny'))->toBeTrue();
    expect($master->hasPermission('audit.viewAny'))->toBeTrue();
});

it('master can access admin users route', function (): void {
    $this->seed(DatabaseSeeder::class);

    $master = User::query()->where('email', 'lfsnascimento84@gmail.com')->firstOrFail();

    $this->actingAs($master)
        ->get('/admin/users')
        ->assertOk();
});

it('admin seeder does not overwrite existing master password', function (): void {
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
    expect($master->hasRole('admin'))->toBeTrue();
    expect($master->approval_status)->toBe(User::APPROVAL_APPROVED);
});
