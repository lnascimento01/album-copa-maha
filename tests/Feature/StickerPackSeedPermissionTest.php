<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\StickerPack;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

it('seeds create sticker pack permissions', function (): void {
    expect(Permission::query()->where('slug', 'stickerPacks.viewAny')->exists())->toBeTrue();
    expect(Permission::query()->where('slug', 'stickerPacks.create')->exists())->toBeTrue();
    expect(Permission::query()->where('slug', 'stickerPacks.viewOwn')->exists())->toBeTrue();
    expect(Permission::query()->where('slug', 'stickerPacks.openOwn')->exists())->toBeTrue();
});

it('admin receives sticker pack permissions', function (): void {
    $admin = User::query()->where('email', 'lfsnascimento84@gmail.com')->firstOrFail();

    expect($admin->hasPermission('stickerPacks.viewAny'))->toBeTrue();
    expect($admin->hasPermission('stickerPacks.create'))->toBeTrue();
    expect($admin->hasPermission('stickerPacks.cancel'))->toBeTrue();
});

it('participant receives own sticker pack permissions', function (): void {
    $participant = Role::query()->where('slug', 'participant')->firstOrFail();

    $permissionSlugs = $participant->permissions()->pluck('slug')->all();

    expect($permissionSlugs)->toContain('stickerPacks.viewOwn');
    expect($permissionSlugs)->toContain('stickerPacks.openOwn');
});

it('sticker pack seeder creates pending packs', function (): void {
    expect(StickerPack::query()->where('status', StickerPack::STATUS_PENDING)->count())->toBeGreaterThanOrEqual(2);
});
