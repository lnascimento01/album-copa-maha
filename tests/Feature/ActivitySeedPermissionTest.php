<?php

use App\Models\Activity;
use App\Models\Permission;
use App\Models\Role;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

it('seeds create activity and activity checkin permissions', function (): void {
    $slugs = [
        'activities.viewAny',
        'activities.view',
        'activities.create',
        'activities.update',
        'activities.open',
        'activities.close',
        'activities.cancel',
        'activityCheckins.viewAny',
        'activityCheckins.create',
        'activityCheckins.revoke',
        'activityCheckins.viewOwn',
    ];

    foreach ($slugs as $slug) {
        $this->assertDatabaseHas('permissions', ['slug' => $slug]);
    }
});

it('admin receives new activity permissions', function (): void {
    $adminRole = Role::query()->where('slug', 'admin')->firstOrFail();

    $expected = Permission::query()
        ->whereIn('slug', ['activities.viewAny', 'activityCheckins.create', 'activityCheckins.revoke'])
        ->pluck('id')
        ->all();

    $rolePermissionIds = $adminRole->permissions()->pluck('permissions.id')->all();

    foreach ($expected as $permissionId) {
        expect($rolePermissionIds)->toContain($permissionId);
    }
});

it('participant receives activity checkin view own permission', function (): void {
    $participantRole = Role::query()->where('slug', 'participant')->firstOrFail();

    expect($participantRole->permissions()->where('slug', 'activityCheckins.viewOwn')->exists())->toBeTrue();
});

it('activity seeder creates open activity', function (): void {
    $activity = Activity::query()->where('slug', 'treino-maha-presenca-inicial')->first();

    expect($activity)->not->toBeNull();
    expect($activity?->status)->toBe(Activity::STATUS_OPEN);
});
