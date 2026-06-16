<?php

use App\Models\Album;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\Sticker;
use App\Models\StickerPack;
use App\Models\StickerPackItem;
use App\Models\User;
use App\Models\UserSticker;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makePackUser(): User
{
    $participant = User::factory()->create();
    $role = Role::query()->where('slug', 'participant')->firstOrFail();
    $participant->roles()->sync([$role->id]);

    return $participant;
}

it('participant opens own pending pack', function (): void {
    $user = makePackUser();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $pack = StickerPack::factory()->create([
        'user_id' => $user->id,
        'album_id' => $album->id,
        'status' => StickerPack::STATUS_PENDING,
        'size' => 3,
    ]);

    $this->actingAs($user)->post("/packs/{$pack->id}/open")->assertRedirect("/packs/{$pack->id}");

    $pack->refresh();

    expect($pack->status)->toBe(StickerPack::STATUS_OPENED);
    expect($pack->opened_at)->not->toBeNull();
    expect(StickerPackItem::query()->where('sticker_pack_id', $pack->id)->count())->toBeGreaterThan(0);
    expect(UserSticker::query()->where('source', 'pack')->where('source_id', $pack->id)->count())->toBeGreaterThan(0);
});

it('opened pack delivers only active stickers from same album and no duplicates for user', function (): void {
    $user = makePackUser();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $otherAlbum = Album::factory()->active()->create();

    $inactiveSticker = Sticker::factory()->for($album)->create(['is_active' => false]);
    Sticker::factory()->for($otherAlbum)->create();

    $alreadyUnlocked = Sticker::query()->where('album_id', $album->id)->where('is_active', true)->firstOrFail();

    UserSticker::query()->create([
        'user_id' => $user->id,
        'sticker_id' => $alreadyUnlocked->id,
        'source' => 'seed',
        'source_id' => null,
        'unlocked_at' => now(),
        'created_at' => now(),
    ]);

    $pack = StickerPack::factory()->create([
        'user_id' => $user->id,
        'album_id' => $album->id,
        'status' => StickerPack::STATUS_PENDING,
        'size' => 3,
    ]);

    $this->actingAs($user)->post("/packs/{$pack->id}/open")->assertRedirect();

    $deliveredIds = StickerPackItem::query()->where('sticker_pack_id', $pack->id)->pluck('sticker_id')->all();

    expect($deliveredIds)->not->toContain($inactiveSticker->id);
    expect($deliveredIds)->not->toContain($alreadyUnlocked->id);

    $albumsOfDelivered = Sticker::query()->whereIn('id', $deliveredIds)->pluck('album_id')->unique()->all();
    expect($albumsOfDelivered)->toBe([$album->id]);
});

it('size rule delivers requested amount when available and less when missing are fewer', function (): void {
    $user = makePackUser();
    $album = Album::factory()->active()->create();

    $stickers = Sticker::factory()->count(4)->for($album)->create(['is_active' => true]);

    $stickers->take(2)->each(function (Sticker $sticker) use ($user): void {
        UserSticker::query()->create([
            'user_id' => $user->id,
            'sticker_id' => $sticker->id,
            'source' => 'seed',
            'source_id' => null,
            'unlocked_at' => now(),
            'created_at' => now(),
        ]);
    });

    $pack = StickerPack::factory()->create([
        'user_id' => $user->id,
        'album_id' => $album->id,
        'status' => StickerPack::STATUS_PENDING,
        'size' => 3,
    ]);

    $this->actingAs($user)->post("/packs/{$pack->id}/open")->assertRedirect();

    expect(StickerPackItem::query()->where('sticker_pack_id', $pack->id)->count())->toBe(2);
});

it('cannot open opened or cancelled pack or another users pack', function (): void {
    $user = makePackUser();
    $other = makePackUser();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $opened = StickerPack::factory()->opened()->create(['user_id' => $user->id, 'album_id' => $album->id]);
    $cancelled = StickerPack::factory()->cancelled()->create(['user_id' => $user->id, 'album_id' => $album->id]);
    $foreign = StickerPack::factory()->create(['user_id' => $other->id, 'album_id' => $album->id]);

    $this->actingAs($user)->post("/packs/{$opened->id}/open")->assertSessionHasErrors('pack');
    $this->actingAs($user)->post("/packs/{$cancelled->id}/open")->assertSessionHasErrors('pack');
    $this->actingAs($user)->post("/packs/{$foreign->id}/open")->assertSessionHasErrors('pack');
});

it('opening pack writes opened audit metadata', function (): void {
    $user = makePackUser();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $pack = StickerPack::factory()->create(['user_id' => $user->id, 'album_id' => $album->id, 'size' => 3]);

    $this->actingAs($user)->post("/packs/{$pack->id}/open")->assertRedirect();

    $log = AuditLog::query()->where('action', 'sticker_pack.opened')->where('entity_id', $pack->id)->first();

    expect($log)->not->toBeNull();
    expect($log?->metadata)->toHaveKey('sticker_ids');
    expect($log?->metadata)->toHaveKey('delivered_count');
});

it('does not open pack when album is complete and logs no missing stickers', function (): void {
    $user = makePackUser();
    $album = Album::factory()->active()->create();

    $stickers = Sticker::factory()->count(3)->for($album)->create(['is_active' => true]);

    foreach ($stickers as $sticker) {
        UserSticker::query()->create([
            'user_id' => $user->id,
            'sticker_id' => $sticker->id,
            'source' => 'seed',
            'source_id' => null,
            'unlocked_at' => now(),
            'created_at' => now(),
        ]);
    }

    $pack = StickerPack::factory()->create(['user_id' => $user->id, 'album_id' => $album->id, 'status' => StickerPack::STATUS_PENDING]);

    $this->actingAs($user)->post("/packs/{$pack->id}/open")->assertSessionHasErrors('pack');

    $pack->refresh();
    expect($pack->status)->toBe(StickerPack::STATUS_PENDING);

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'sticker_pack.no_missing_stickers',
        'entity_id' => $pack->id,
    ]);
});

it('delivers epic sticker when it is the only missing one', function (): void {
    $user = makePackUser();
    $album = Album::factory()->active()->create();

    $epic = Sticker::factory()->for($album)->create(['rarity' => Sticker::RARITY_EPIC]);

    $pack = StickerPack::factory()->create([
        'user_id' => $user->id,
        'album_id' => $album->id,
        'status' => StickerPack::STATUS_PENDING,
        'size' => 1,
    ]);

    $this->actingAs($user)->post("/packs/{$pack->id}/open")->assertRedirect();

    $deliveredIds = StickerPackItem::query()->where('sticker_pack_id', $pack->id)->pluck('sticker_id')->all();

    expect($deliveredIds)->toContain($epic->id);
});

it('falls back to common pool when epic pool is fully owned', function (): void {
    $user = makePackUser();
    $album = Album::factory()->active()->create();

    $ownedEpic = Sticker::factory()->for($album)->create(['rarity' => Sticker::RARITY_EPIC]);

    UserSticker::query()->create([
        'user_id' => $user->id,
        'sticker_id' => $ownedEpic->id,
        'source' => 'seed',
        'source_id' => null,
        'unlocked_at' => now(),
        'created_at' => now(),
    ]);

    Sticker::factory()->count(3)->for($album)->create(['rarity' => Sticker::RARITY_COMMON]);

    $pack = StickerPack::factory()->create([
        'user_id' => $user->id,
        'album_id' => $album->id,
        'status' => StickerPack::STATUS_PENDING,
        'size' => 2,
    ]);

    $this->actingAs($user)->post("/packs/{$pack->id}/open")->assertRedirect();

    $deliveredIds = StickerPackItem::query()->where('sticker_pack_id', $pack->id)->pluck('sticker_id')->all();

    expect($deliveredIds)->toHaveCount(2);
    expect($deliveredIds)->not->toContain($ownedEpic->id);

    $deliveredRarities = Sticker::query()->whereIn('id', $deliveredIds)->pluck('rarity')->unique()->values()->all();

    expect($deliveredRarities)->toBe([Sticker::RARITY_COMMON]);
});

it('second attempt to open same pack does not duplicate items or user stickers', function (): void {
    $user = makePackUser();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $pack = StickerPack::factory()->create(['user_id' => $user->id, 'album_id' => $album->id, 'status' => StickerPack::STATUS_PENDING]);

    $this->actingAs($user)->post("/packs/{$pack->id}/open")->assertRedirect();
    $this->actingAs($user)->post("/packs/{$pack->id}/open")->assertSessionHasErrors('pack');

    $itemsCount = StickerPackItem::query()->where('sticker_pack_id', $pack->id)->count();
    $uniqueUserStickerCount = UserSticker::query()->where('source', 'pack')->where('source_id', $pack->id)->count();

    expect($itemsCount)->toBe($uniqueUserStickerCount);
});
