<?php

use App\Models\Album;
use App\Models\Role;
use App\Models\Sticker;
use App\Models\Team;
use App\Models\User;
use App\Models\UserSticker;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeStickerAdmin(): User
{
    $admin = User::factory()->create();
    $role = Role::query()->where('slug', 'admin')->firstOrFail();
    $admin->roles()->sync([$role->id]);

    return $admin;
}

function makeApprovedParticipantWithRole(): User
{
    $participant = User::factory()->create();
    $participantRole = Role::query()->where('slug', 'participant')->firstOrFail();
    $participant->roles()->sync([$participantRole->id]);

    return $participant;
}

it('admin creates sticker', function (): void {
    $admin = makeStickerAdmin();
    $album = Album::factory()->create();

    $this->actingAs($admin)
        ->post('/admin/stickers', [
            'album_id' => $album->id,
            'code' => 'abc-001',
            'title' => 'Sticker Teste',
            'type' => Sticker::TYPE_PLAYER,
            'rarity' => Sticker::RARITY_COMMON,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('stickers', [
        'album_id' => $album->id,
        'code' => 'ABC-001',
    ]);
});

it('admin edits sticker', function (): void {
    $admin = makeStickerAdmin();
    $sticker = Sticker::factory()->create();

    $this->actingAs($admin)
        ->patch("/admin/stickers/{$sticker->id}", [
            'album_id' => $sticker->album_id,
            'code' => 'edt-001',
            'title' => 'Sticker Editado',
            'type' => Sticker::TYPE_PLAYER,
            'rarity' => Sticker::RARITY_RARE,
        ])
        ->assertRedirect();

    $sticker->refresh();

    expect($sticker->title)->toBe('Sticker Editado');
    expect($sticker->code)->toBe('EDT-001');
});

it('sticker requires album id code and title', function (): void {
    $admin = makeStickerAdmin();

    $this->actingAs($admin)
        ->post('/admin/stickers', [])
        ->assertSessionHasErrors(['album_id', 'code', 'title']);
});

it('does not allow duplicate code in same album', function (): void {
    $admin = makeStickerAdmin();
    $album = Album::factory()->create();
    Sticker::factory()->for($album)->create(['code' => 'MAHA-001']);

    $this->actingAs($admin)
        ->post('/admin/stickers', [
            'album_id' => $album->id,
            'code' => 'MAHA-001',
            'title' => 'Duplicada',
            'type' => Sticker::TYPE_PLAYER,
            'rarity' => Sticker::RARITY_COMMON,
        ])
        ->assertSessionHasErrors('code');
});

it('allows same code in different albums', function (): void {
    $admin = makeStickerAdmin();
    $teamA = Team::factory()->create();
    $teamB = Team::factory()->create();
    $albumA = Album::factory()->for($teamA)->create();
    $albumB = Album::factory()->for($teamB)->create();

    Sticker::factory()->for($albumA)->create(['code' => 'MAHA-050']);

    $this->actingAs($admin)
        ->post('/admin/stickers', [
            'album_id' => $albumB->id,
            'code' => 'MAHA-050',
            'title' => 'Mesmo Código',
            'type' => Sticker::TYPE_PLAYER,
            'rarity' => Sticker::RARITY_COMMON,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('stickers', [
        'album_id' => $albumB->id,
        'code' => 'MAHA-050',
    ]);
});

it('participant sees active sticker grid', function (): void {
    $participant = makeApprovedParticipantWithRole();

    $this->actingAs($participant)
        ->get('/album')
        ->assertOk()
        ->assertSee('"component":"album\\/index"', false);
});

it('locked sticker appears locked', function (): void {
    $participant = makeApprovedParticipantWithRole();

    $response = $this->actingAs($participant)->get('/album');

    $response->assertOk()->assertSee('"title":"Figurinha bloqueada"', false);
});

it('unlocked sticker appears complete when user_sticker exists', function (): void {
    $participant = makeApprovedParticipantWithRole();
    $sticker = Sticker::query()->firstOrFail();

    UserSticker::query()->create([
        'user_id' => $participant->id,
        'sticker_id' => $sticker->id,
        'source' => 'seed',
        'unlocked_at' => now(),
        'created_at' => now(),
    ]);

    $this->actingAs($participant)
        ->get("/album/stickers/{$sticker->id}")
        ->assertOk()
        ->assertSee($sticker->title);
});

it('creating sticker writes audit log', function (): void {
    $admin = makeStickerAdmin();
    $album = Album::factory()->create();

    $this->actingAs($admin)
        ->post('/admin/stickers', [
            'album_id' => $album->id,
            'code' => 'AUD-001',
            'title' => 'Audit Create',
            'type' => Sticker::TYPE_PLAYER,
            'rarity' => Sticker::RARITY_COMMON,
        ])
        ->assertRedirect();

    $sticker = Sticker::query()->where('code', 'AUD-001')->firstOrFail();

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'sticker.created',
        'actor_user_id' => $admin->id,
        'entity_id' => $sticker->id,
    ]);
});

it('editing sticker writes audit log', function (): void {
    $admin = makeStickerAdmin();
    $sticker = Sticker::factory()->create(['code' => 'AUD-100']);

    $this->actingAs($admin)
        ->patch("/admin/stickers/{$sticker->id}", [
            'album_id' => $sticker->album_id,
            'code' => 'AUD-101',
            'title' => 'Audit Update',
            'type' => Sticker::TYPE_PLAYER,
            'rarity' => Sticker::RARITY_COMMON,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'sticker.updated',
        'actor_user_id' => $admin->id,
        'entity_id' => $sticker->id,
    ]);
});

it('does not show archived album stickers in participant album page', function (): void {
    $participant = makeApprovedParticipantWithRole();
    $archivedAlbum = Album::factory()->archived()->create();
    $archivedSticker = Sticker::factory()->for($archivedAlbum)->create(['title' => 'Arquivada']);

    $response = $this->actingAs($participant)->get('/album');

    $response->assertOk()->assertDontSee($archivedSticker->code);
});
