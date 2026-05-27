<?php

use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeCatalogAdminUser(): User
{
    $admin = User::factory()->create();
    $adminRole = Role::query()->where('slug', 'admin')->firstOrFail();
    $admin->roles()->sync([$adminRole->id]);

    return $admin;
}

function makeCatalogParticipant(): User
{
    $user = User::factory()->create();
    $participantRole = Role::query()->where('slug', 'participant')->firstOrFail();
    $user->roles()->sync([$participantRole->id]);

    return $user;
}

it('admin accesses admin teams', function (): void {
    $admin = makeCatalogAdminUser();

    $this->actingAs($admin)->get('/admin/teams')->assertOk();
});

it('admin accesses admin albums', function (): void {
    $admin = makeCatalogAdminUser();

    $this->actingAs($admin)->get('/admin/albums')->assertOk();
});

it('admin accesses admin players', function (): void {
    $admin = makeCatalogAdminUser();

    $this->actingAs($admin)->get('/admin/players')->assertOk();
});

it('admin accesses admin stickers', function (): void {
    $admin = makeCatalogAdminUser();

    $this->actingAs($admin)->get('/admin/stickers')->assertOk();
});

it('admin accesses admin rankings achievements and share cards', function (): void {
    $admin = makeCatalogAdminUser();

    $this->actingAs($admin)->get('/admin/rankings')->assertOk();
    $this->actingAs($admin)->get('/admin/achievements')->assertOk();
    $this->actingAs($admin)->get('/admin/share-cards')->assertOk();
});

it('participant cannot access admin albums', function (): void {
    $participant = makeCatalogParticipant();

    $this->actingAs($participant)->get('/admin/albums')->assertForbidden();
});

it('participant cannot access admin rankings achievements and share cards', function (): void {
    $participant = makeCatalogParticipant();

    $this->actingAs($participant)->get('/admin/rankings')->assertForbidden();
    $this->actingAs($participant)->get('/admin/achievements')->assertForbidden();
    $this->actingAs($participant)->get('/admin/share-cards')->assertForbidden();
});

it('approved participant accesses album', function (): void {
    $participant = makeCatalogParticipant();

    $this->actingAs($participant)->get('/album')->assertOk();
});

it('pending user cannot access album', function (): void {
    $pending = User::factory()->pendingApproval()->create();
    $participantRole = Role::query()->where('slug', 'participant')->firstOrFail();
    $pending->roles()->sync([$participantRole->id]);

    $this->actingAs($pending)->get('/album')->assertRedirect(route('approval.pending', absolute: false));
});

it('approved user without albumCollection permission receives 403', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/album')->assertForbidden();

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'permission.denied',
        'actor_user_id' => $user->id,
    ]);
});
