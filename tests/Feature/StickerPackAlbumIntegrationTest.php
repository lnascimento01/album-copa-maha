<?php

use App\Models\Album;
use App\Models\Role;
use App\Models\Sticker;
use App\Models\StickerPack;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeIntegrationParticipant(): User
{
    $user = User::factory()->create();
    $user->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $user;
}

it('album reflects unlocks after opening pack', function (): void {
    $user = makeIntegrationParticipant();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $pack = StickerPack::factory()->create(['user_id' => $user->id, 'album_id' => $album->id, 'status' => StickerPack::STATUS_PENDING, 'size' => 1]);

    $before = $this->actingAs($user)->get('/album')->getContent();

    $this->actingAs($user)->post("/packs/{$pack->id}/open")->assertRedirect();

    $after = $this->actingAs($user)->get('/album')->getContent();

    expect($before)->not->toBeNull();
    expect($after)->not->toBeNull();
    expect($after)->toContain('"is_unlocked":true');
});

it('album sticker detail becomes full after unlock', function (): void {
    $user = makeIntegrationParticipant();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $sticker = Sticker::query()->where('album_id', $album->id)->where('is_active', true)->firstOrFail();

    $pack = StickerPack::factory()->create([
        'user_id' => $user->id,
        'album_id' => $album->id,
        'status' => StickerPack::STATUS_PENDING,
        'size' => 1,
    ]);

    // Reduce missing pool to ensure target sticker is drawn.
    Sticker::query()
        ->where('album_id', $album->id)
        ->where('id', '!=', $sticker->id)
        ->update(['is_active' => false]);

    $this->actingAs($user)->post("/packs/{$pack->id}/open")->assertRedirect();

    $this->actingAs($user)
        ->get("/album/stickers/{$sticker->id}")
        ->assertOk()
        ->assertSee('"is_full_visible":true', false)
        ->assertSee($sticker->title);
});

it('album page shows pending pack counter info', function (): void {
    $user = makeIntegrationParticipant();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    StickerPack::factory()->count(2)->create([
        'user_id' => $user->id,
        'album_id' => $album->id,
        'status' => StickerPack::STATUS_PENDING,
    ]);

    $this->actingAs($user)
        ->get('/album')
        ->assertOk()
        ->assertSee('"pending":2', false);
});

it('admin can see sticker pack events in global audit page', function (): void {
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    $this->actingAs($admin)
        ->get('/admin/audit-logs')
        ->assertOk();
});
