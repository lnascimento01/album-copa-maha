<?php

use App\Models\Achievement;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

it('seeds stage 7 ranking achievements and share card permissions', function (): void {
    foreach ([
        'rankings.viewAny',
        'rankings.view',
        'achievements.viewAny',
        'achievements.view',
        'achievements.viewOwn',
        'achievements.create',
        'achievements.update',
        'achievements.grant',
        'shareCards.viewAny',
        'shareCards.viewOwn',
        'shareCards.createOwn',
    ] as $slug) {
        expect(Permission::query()->where('slug', $slug)->exists())->toBeTrue();
    }
});

it('admin role receives all stage 7 permissions', function (): void {
    $adminRole = Role::query()->where('slug', 'admin')->firstOrFail();
    $slugs = $adminRole->permissions()->pluck('slug')->all();

    expect($slugs)->toContain('rankings.viewAny');
    expect($slugs)->toContain('achievements.grant');
    expect($slugs)->toContain('shareCards.viewAny');
});

it('participant role receives own stage 7 permissions', function (): void {
    $participantRole = Role::query()->where('slug', 'participant')->firstOrFail();
    $slugs = $participantRole->permissions()->pluck('slug')->all();

    expect($slugs)->toContain('rankings.view');
    expect($slugs)->toContain('achievements.viewOwn');
    expect($slugs)->toContain('shareCards.viewOwn');
    expect($slugs)->toContain('shareCards.createOwn');
    expect($slugs)->not->toContain('achievements.viewAny');
});

it('achievement seeder creates default achievements', function (): void {
    expect(Achievement::query()->count())->toBeGreaterThanOrEqual(9);

    expect(Achievement::query()->where('slug', 'primeira-figurinha')->exists())->toBeTrue();
    expect(Achievement::query()->where('slug', 'primeiras-10-figurinhas')->exists())->toBeTrue();
    expect(Achievement::query()->where('slug', 'metade-do-album')->exists())->toBeTrue();
    expect(Achievement::query()->where('slug', 'album-completo')->exists())->toBeTrue();
});

it('participant can access ranking achievements and share cards routes', function (): void {
    $participant = User::factory()->create();
    $participant->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    $this->actingAs($participant)->get('/ranking')->assertOk();
    $this->actingAs($participant)->get('/achievements')->assertOk();
    $this->actingAs($participant)->get('/share-cards')->assertOk();
});
