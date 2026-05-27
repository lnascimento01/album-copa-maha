<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(RolePermissionSeeder::class);
});

function makeAdminWithRole(): User
{
    $admin = User::factory()->create();
    $role = Role::query()->where('slug', 'admin')->firstOrFail();
    $admin->roles()->attach($role->id);

    return $admin;
}

it('admin with users.viewAny can access admin users list', function (): void {
    $admin = makeAdminWithRole();

    $this->actingAs($admin)
        ->get('/admin/users')
        ->assertOk();
});

it('participant cannot access admin users list', function (): void {
    $participant = User::factory()->create();

    $this->actingAs($participant)
        ->get('/admin/users')
        ->assertForbidden();
});

it('permission middleware returns 403', function (): void {
    $participant = User::factory()->create();

    $this->actingAs($participant)
        ->get('/admin/users')
        ->assertStatus(403);
});

it('effective permissions by role work', function (): void {
    $role = Role::query()->create([
        'name' => 'Auditor',
        'slug' => 'auditor',
        'description' => 'Audit role',
        'is_system' => false,
    ]);

    $permission = Permission::query()->where('slug', 'audit.viewAny')->firstOrFail();
    $role->permissions()->attach($permission->id);

    $user = User::factory()->create();
    $user->roles()->attach($role->id);

    expect($user->hasPermission('audit.viewAny'))->toBeTrue();
    expect($user->hasPermission('users.approve'))->toBeFalse();
});
