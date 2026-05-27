<?php

use App\Models\Role;
use App\Models\StickerPack;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makePackParticipant(): User
{
    $participant = User::factory()->create();
    $role = Role::query()->where('slug', 'participant')->firstOrFail();
    $participant->roles()->sync([$role->id]);

    return $participant;
}

it('participant sees own packs list', function (): void {
    $participant = makePackParticipant();

    StickerPack::factory()->create(['user_id' => $participant->id]);

    $this->actingAs($participant)
        ->get('/packs')
        ->assertOk()
        ->assertSee('"component":"packs\\/index"', false);
});

it('participant does not see another users pack details', function (): void {
    $participant = makePackParticipant();
    $other = makePackParticipant();

    $pack = StickerPack::factory()->create(['user_id' => $other->id]);

    $this->actingAs($participant)
        ->get("/packs/{$pack->id}")
        ->assertForbidden();
});

it('admin sees all packs', function (): void {
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    StickerPack::factory()->count(3)->create();

    $this->actingAs($admin)
        ->get('/admin/sticker-packs')
        ->assertOk();
});

it('participant can view own pack detail', function (): void {
    $participant = makePackParticipant();
    $pack = StickerPack::factory()->create(['user_id' => $participant->id]);

    $this->actingAs($participant)
        ->get("/packs/{$pack->id}")
        ->assertOk()
        ->assertSee('"component":"packs\\/show"', false);
});
