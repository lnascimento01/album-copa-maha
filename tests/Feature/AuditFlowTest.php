<?php

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(RolePermissionSeeder::class);
});

function makeAuditAdmin(): User
{
    $admin = User::factory()->create();
    $role = Role::query()->where('slug', 'admin')->firstOrFail();
    $admin->roles()->attach($role->id);

    return $admin;
}

it('registration generates user registered audit log', function (): void {
    $this->post(route('register.store'), [
        'name' => 'Audit Register',
        'email' => 'audit-register@maha.local',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $user = User::query()->where('email', 'audit-register@maha.local')->firstOrFail();

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'user.registered',
        'actor_user_id' => $user->id,
        'target_user_id' => $user->id,
    ]);
});

it('login generates user login audit log', function (): void {
    $user = User::factory()->create([
        'email' => 'audit-login@maha.local',
        'password' => 'password',
    ]);

    $this->post(route('login.store'), [
        'email' => 'audit-login@maha.local',
        'password' => 'password',
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'user.login',
        'actor_user_id' => $user->id,
        'target_user_id' => $user->id,
    ]);
});

it('denied action generates permission denied audit log', function (): void {
    $participant = User::factory()->create();

    $this->actingAs($participant)
        ->get('/admin/users')
        ->assertForbidden();

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'permission.denied',
        'actor_user_id' => $participant->id,
    ]);
});

it('admin can view audit logs', function (): void {
    $admin = makeAuditAdmin();

    $this->actingAs($admin)
        ->get('/admin/audit-logs')
        ->assertOk();
});

it('participant cannot view global audit logs', function (): void {
    $participant = User::factory()->create();

    $this->actingAs($participant)
        ->get('/admin/audit-logs')
        ->assertForbidden();
});

it('logout generates user logout audit log', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('logout'))
        ->assertRedirect(route('home', absolute: false));

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'user.logout',
        'actor_user_id' => $user->id,
        'target_user_id' => $user->id,
    ]);
});
