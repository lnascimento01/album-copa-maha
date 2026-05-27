<?php

use App\Models\Album;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Sticker;
use App\Models\Team;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

it('seeds create new album permissions', function (): void {
    expect(Permission::query()->where('slug', 'teams.viewAny')->exists())->toBeTrue();
    expect(Permission::query()->where('slug', 'albums.publish')->exists())->toBeTrue();
    expect(Permission::query()->where('slug', 'stickers.create')->exists())->toBeTrue();
});

it('admin receives new permissions', function (): void {
    $admin = User::query()->where('email', 'lfsnascimento84@gmail.com')->firstOrFail();

    expect($admin->hasPermission('teams.viewAny'))->toBeTrue();
    expect($admin->hasPermission('albums.publish'))->toBeTrue();
    expect($admin->hasPermission('players.update'))->toBeTrue();
    expect($admin->hasPermission('stickers.delete'))->toBeTrue();
});

it('participant receives albumCollection view own permission', function (): void {
    $participantRole = Role::query()->where('slug', 'participant')->firstOrFail();
    $permission = Permission::query()->where('slug', 'albumCollection.viewOwn')->firstOrFail();

    expect($participantRole->permissions()->whereKey($permission->id)->exists())->toBeTrue();
});

it('team seeder creates MAHA', function (): void {
    $team = Team::query()->where('slug', 'maha')->first();

    expect($team)->not->toBeNull();
    expect($team?->name)->toBe('MAHA');
});

it('album seeder creates active album', function (): void {
    $album = Album::query()->where('slug', 'album-copa-maha-2026')->first();

    expect($album)->not->toBeNull();
    expect($album?->status)->toBe(Album::STATUS_ACTIVE);
    expect($album?->published_at)->not->toBeNull();
});

it('sticker catalog seeder creates initial stickers', function (): void {
    $count = Sticker::query()->count();

    expect($count)->toBeGreaterThanOrEqual(15);
});
