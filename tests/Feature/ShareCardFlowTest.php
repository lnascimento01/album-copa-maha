<?php

use App\Models\Achievement;
use App\Models\Album;
use App\Models\Role;
use App\Models\ShareCard;
use App\Models\User;
use App\Models\UserAchievement;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeShareAdmin(): User
{
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    return $admin;
}

function makeShareParticipant(): User
{
    $user = User::factory()->create();
    $user->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $user;
}

it('participant can access own share cards and admin can access global share cards', function (): void {
    $admin = makeShareAdmin();
    $participant = makeShareParticipant();

    $this->actingAs($participant)->get('/share-cards')->assertOk();
    $this->actingAs($admin)->get('/admin/share-cards')->assertOk();
});

it('participant creates album progress card and audit is recorded', function (): void {
    $participant = makeShareParticipant();

    $this->actingAs($participant)->post('/share-cards', [
        'type' => 'album_progress',
    ])->assertRedirect();

    $card = ShareCard::query()->where('user_id', $participant->id)->latest('id')->firstOrFail();

    expect($card->payload)->toHaveKeys(['user_name', 'album_name', 'title', 'type']);

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'share_card.created',
        'entity_id' => $card->id,
        'actor_user_id' => $participant->id,
    ]);
});

it('participant can create achievement card only for own unlocked achievement', function (): void {
    $participant = makeShareParticipant();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $achievement = Achievement::query()->where('slug', 'primeira-figurinha')->firstOrFail();

    UserAchievement::query()->create([
        'user_id' => $participant->id,
        'achievement_id' => $achievement->id,
        'album_id' => $album->id,
        'unlocked_at' => now(),
        'source' => 'seed',
    ]);

    $this->actingAs($participant)->post('/share-cards', [
        'type' => 'achievement_unlocked',
        'achievement_id' => $achievement->id,
    ])->assertRedirect();

    expect(ShareCard::query()->where('user_id', $participant->id)->where('type', ShareCard::TYPE_ACHIEVEMENT_UNLOCKED)->exists())->toBeTrue();

    $other = makeShareParticipant();

    $this->actingAs($other)
        ->from('/share-cards')
        ->post('/share-cards', [
            'type' => 'achievement_unlocked',
            'achievement_id' => $achievement->id,
        ])
        ->assertSessionHasErrors('card');
});

it('participant cannot view share card from another user', function (): void {
    $owner = makeShareParticipant();
    $viewer = makeShareParticipant();

    $card = ShareCard::factory()->create([
        'user_id' => $owner->id,
        'type' => ShareCard::TYPE_ALBUM_PROGRESS,
    ]);

    $this->actingAs($viewer)->get("/share-cards/{$card->id}")->assertForbidden();
    $this->actingAs($owner)->get("/share-cards/{$card->id}")->assertOk();
});

it('admin can view share card detail', function (): void {
    $admin = makeShareAdmin();
    $participant = makeShareParticipant();

    $card = ShareCard::factory()->create([
        'user_id' => $participant->id,
    ]);

    $this->actingAs($admin)->get("/admin/share-cards/{$card->id}")->assertOk();
});
