<?php

declare(strict_types=1);

use App\Models\Achievement;
use App\Models\Activity;
use App\Models\Album;
use App\Models\RewardCode;
use App\Models\Role;
use App\Models\SocialMission;
use App\Models\Sticker;
use App\Models\Team;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('database seeder includes demo data by default', function (): void {
    config(['app.seed_demo_data' => true]);
    $this->seed(DatabaseSeeder::class);

    expect(Team::query()->where('slug', 'maha')->exists())->toBeTrue();
    expect(Album::query()->where('slug', 'album-copa-maha-2026')->exists())->toBeTrue();
    expect(Sticker::query()->count())->toBeGreaterThan(0);
    expect(Activity::query()->count())->toBeGreaterThan(0);
    expect(RewardCode::query()->count())->toBeGreaterThan(0);
    expect(SocialMission::query()->count())->toBeGreaterThan(0);
    expect(Achievement::query()->count())->toBeGreaterThan(0);
});

it('database seeder can run with system-minimum data only when demo toggle is disabled', function (): void {
    config(['app.seed_demo_data' => false]);
    $this->seed(DatabaseSeeder::class);

    $master = User::query()->where('email', 'lfsnascimento84@gmail.com')->first();
    $adminRole = Role::query()->where('slug', 'admin')->first();
    $participantRole = Role::query()->where('slug', 'participant')->first();

    expect($master)->not->toBeNull();
    expect($adminRole)->not->toBeNull();
    expect($participantRole)->not->toBeNull();
    expect(Team::query()->where('slug', 'maha')->exists())->toBeTrue();
    expect(Album::query()->where('slug', 'album-copa-maha-2026')->exists())->toBeTrue();

    expect(Sticker::query()->count())->toBe(0);
    expect(Activity::query()->count())->toBe(0);
    expect(RewardCode::query()->count())->toBe(0);
    expect(SocialMission::query()->count())->toBe(0);
    expect(Achievement::query()->count())->toBe(0);
});
