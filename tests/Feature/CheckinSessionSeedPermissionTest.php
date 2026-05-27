<?php

use App\Models\Permission;
use App\Models\Role;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

it('seeds create permissions for checkin sessions and self checkin', function (): void {
    $slugs = [
        'activityCheckinSessions.viewAny',
        'activityCheckinSessions.create',
        'activityCheckinSessions.revoke',
        'activityCheckins.selfCreate',
    ];

    foreach ($slugs as $slug) {
        $this->assertDatabaseHas('permissions', ['slug' => $slug]);
    }
});

it('admin receives checkin session permissions', function (): void {
    $adminRole = Role::query()->where('slug', 'admin')->firstOrFail();

    $permissionIds = Permission::query()
        ->whereIn('slug', ['activityCheckinSessions.create', 'activityCheckinSessions.revoke'])
        ->pluck('id')
        ->all();

    $rolePermissionIds = $adminRole->permissions()->pluck('permissions.id')->all();

    foreach ($permissionIds as $permissionId) {
        expect($rolePermissionIds)->toContain($permissionId);
    }
});

it('participant receives self checkin permission', function (): void {
    $participantRole = Role::query()->where('slug', 'participant')->firstOrFail();

    expect($participantRole->permissions()->where('slug', 'activityCheckins.selfCreate')->exists())->toBeTrue();
});
