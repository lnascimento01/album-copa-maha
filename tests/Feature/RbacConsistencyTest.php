<?php

declare(strict_types=1);

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(RolePermissionSeeder::class);
});

/**
 * @return array<int, string>
 */
function permissionSlugsUsedInRoutes(): array
{
    return collect(Route::getRoutes()->getRoutes())
        ->flatMap(fn ($route) => collect($route->gatherMiddleware()))
        ->filter(fn ($middleware) => is_string($middleware) && str_starts_with($middleware, 'permission:'))
        ->map(fn (string $middleware) => (string) str($middleware)->after('permission:'))
        ->filter()
        ->unique()
        ->sort()
        ->values()
        ->all();
}

it('all permission slugs used in routes exist in seeded permissions', function (): void {
    $routePermissionSlugs = permissionSlugsUsedInRoutes();
    $seededSlugs = Permission::query()->pluck('slug')->all();

    expect($routePermissionSlugs)->not->toBeEmpty();
    expect(array_values(array_diff($routePermissionSlugs, $seededSlugs)))->toBe([]);
});

it('admin role has every seeded permission', function (): void {
    $adminRole = Role::query()->where('slug', 'admin')->firstOrFail();
    $allPermissions = Permission::query()->pluck('id')->sort()->values()->all();
    $adminPermissions = $adminRole->permissions()->pluck('permissions.id')->sort()->values()->all();

    expect($adminPermissions)->toBe($allPermissions);
});

it('participant role keeps only own-scoped permissions', function (): void {
    $participant = User::factory()->create();
    $participantRole = Role::query()->where('slug', 'participant')->firstOrFail();
    $participant->roles()->sync([$participantRole->id]);

    $expectedAllowed = [
        'albumCollection.viewOwn',
        'stickerPacks.viewOwn',
        'stickerPacks.openOwn',
        'activityCheckins.viewOwn',
        'activityCheckins.selfCreate',
        'rewardCodes.redeemOwn',
        'rewardCodeRedemptions.viewOwn',
        'socialMissionSubmissions.viewOwn',
        'socialMissionSubmissions.createOwn',
        'rankings.view',
        'achievements.viewOwn',
        'shareCards.viewOwn',
        'shareCards.createOwn',
    ];

    foreach ($expectedAllowed as $slug) {
        expect($participant->hasPermission($slug))->toBeTrue();
    }

    foreach (['users.viewAny', 'audit.viewAny', 'activities.create', 'rewardCodes.create', 'socialMissionSubmissions.approve'] as $adminOnlySlug) {
        expect($participant->hasPermission($adminOnlySlug))->toBeFalse();
    }
});

it('there are no critical admin permissions orphaned from admin role', function (): void {
    $adminRole = Role::query()->where('slug', 'admin')->firstOrFail();

    $missing = Permission::query()
        ->whereDoesntHave('roles', fn ($query) => $query->where('roles.id', $adminRole->id))
        ->pluck('slug')
        ->all();

    expect($missing)->toBe([]);
});

it('delete permissions are not exposed in route middleware in this phase', function (): void {
    $deletePermissionsInRoutes = collect(permissionSlugsUsedInRoutes())
        ->filter(fn (string $slug) => str_ends_with($slug, '.delete'))
        ->values()
        ->all();

    expect($deletePermissionsInRoutes)->toBe([]);
});
