<?php

use App\Models\Permission;
use App\Models\RewardCode;
use App\Models\Role;
use App\Models\SocialMission;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

it('seeds create reward code and social mission permissions', function (): void {
    $slugs = [
        'rewardCodes.viewAny',
        'rewardCodes.view',
        'rewardCodes.create',
        'rewardCodes.update',
        'rewardCodes.activate',
        'rewardCodes.revoke',
        'rewardCodes.redeemOwn',
        'rewardCodeRedemptions.viewAny',
        'rewardCodeRedemptions.viewOwn',
        'socialMissions.viewAny',
        'socialMissions.view',
        'socialMissions.create',
        'socialMissions.update',
        'socialMissions.activate',
        'socialMissions.close',
        'socialMissions.cancel',
        'socialMissionSubmissions.viewAny',
        'socialMissionSubmissions.viewOwn',
        'socialMissionSubmissions.createOwn',
        'socialMissionSubmissions.approve',
        'socialMissionSubmissions.reject',
    ];

    foreach ($slugs as $slug) {
        $this->assertDatabaseHas('permissions', ['slug' => $slug]);
    }
});

it('admin receives all new permissions and participant receives own permissions', function (): void {
    $adminRole = Role::query()->where('slug', 'admin')->firstOrFail();
    $participantRole = Role::query()->where('slug', 'participant')->firstOrFail();

    $adminPermissionIds = $adminRole->permissions()->pluck('permissions.id')->all();

    $mustHaveForAdmin = Permission::query()->whereIn('slug', [
        'rewardCodes.create',
        'rewardCodes.activate',
        'socialMissions.create',
        'socialMissionSubmissions.approve',
    ])->pluck('id')->all();

    foreach ($mustHaveForAdmin as $permissionId) {
        expect($adminPermissionIds)->toContain($permissionId);
    }

    expect($participantRole->permissions()->where('slug', 'rewardCodes.redeemOwn')->exists())->toBeTrue();
    expect($participantRole->permissions()->where('slug', 'rewardCodeRedemptions.viewOwn')->exists())->toBeTrue();
    expect($participantRole->permissions()->where('slug', 'socialMissionSubmissions.viewOwn')->exists())->toBeTrue();
    expect($participantRole->permissions()->where('slug', 'socialMissionSubmissions.createOwn')->exists())->toBeTrue();
});

it('reward code and social mission seeders create default records', function (): void {
    $rewardCode = RewardCode::query()->where('code', 'MAHA10')->first();
    $mission = SocialMission::query()->where('slug', 'postar-story-marcando-time')->first();

    expect($rewardCode)->not->toBeNull();
    expect($rewardCode?->status)->toBe(RewardCode::STATUS_ACTIVE);

    expect($mission)->not->toBeNull();
    expect($mission?->status)->toBe(SocialMission::STATUS_ACTIVE);
});
