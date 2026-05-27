<?php

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(RolePermissionSeeder::class);
});

function makeAdminUser(): User
{
    $admin = User::factory()->create();
    $adminRole = Role::query()->where('slug', 'admin')->firstOrFail();
    $admin->roles()->attach($adminRole->id);

    return $admin;
}

it('admin can list users', function (): void {
    $admin = makeAdminUser();

    $this->actingAs($admin)
        ->get('/admin/users')
        ->assertOk();
});

it('admin can approve pending user', function (): void {
    $admin = makeAdminUser();
    $pending = User::factory()->pendingApproval()->create();

    $this->actingAs($admin)
        ->patch("/admin/users/{$pending->id}/approve")
        ->assertRedirect();

    $this->assertDatabaseHas('users', [
        'id' => $pending->id,
        'approval_status' => User::APPROVAL_APPROVED,
    ]);
});

it('approval writes approved fields', function (): void {
    $admin = makeAdminUser();
    $pending = User::factory()->pendingApproval()->create();

    $this->actingAs($admin)
        ->patch("/admin/users/{$pending->id}/approve");

    $pending->refresh();

    expect($pending->approved_at)->not->toBeNull();
    expect($pending->approved_by)->toBe($admin->id);
});

it('approval generates audit log', function (): void {
    $admin = makeAdminUser();
    $pending = User::factory()->pendingApproval()->create();

    $this->actingAs($admin)
        ->patch("/admin/users/{$pending->id}/approve");

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'user.approved',
        'actor_user_id' => $admin->id,
        'target_user_id' => $pending->id,
    ]);
});

it('user without permission cannot approve others', function (): void {
    $participant = User::factory()->create();
    $target = User::factory()->pendingApproval()->create();

    $this->actingAs($participant)
        ->patch("/admin/users/{$target->id}/approve")
        ->assertForbidden();
});
