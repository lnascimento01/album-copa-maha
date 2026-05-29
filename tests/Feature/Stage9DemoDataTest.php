<?php

use App\Models\Achievement;
use App\Models\Album;
use App\Models\RewardCode;
use App\Models\Role;
use App\Models\ShareCard;
use App\Models\SocialMission;
use App\Models\SocialMissionSubmission;
use App\Models\Sticker;
use App\Models\StickerPack;
use App\Models\Team;
use App\Models\User;
use App\Models\UserAchievement;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeStage9Admin(): User
{
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    return $admin;
}

function makeStage9Participant(): User
{
    $participant = User::factory()->create();
    $participant->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $participant;
}

it('seeds create realistic maha base data', function (): void {
    $team = Team::query()->where('slug', 'maha')->first();
    $album = Album::query()->where('slug', 'album-copa-maha-2026')->first();

    expect($team)->not->toBeNull();
    expect($album)->not->toBeNull();
    expect($album?->status)->toBe(Album::STATUS_ACTIVE);

    expect(Sticker::query()->count())->toBeGreaterThanOrEqual(25);

    expect(Sticker::query()->where('title', 'like', 'Jogador %')->exists())->toBeFalse();
    expect(Sticker::query()->where('title', 'like', 'Momento 0%')->exists())->toBeFalse();

    expect(Sticker::query()->where('type', Sticker::TYPE_PLAYER)->exists())->toBeTrue();
    expect(Sticker::query()->where('type', Sticker::TYPE_GOALKEEPER)->exists())->toBeTrue();
    expect(Sticker::query()->where('type', Sticker::TYPE_STAFF)->exists())->toBeTrue();
    expect(Sticker::query()->where('type', Sticker::TYPE_MOMENT)->exists())->toBeTrue();
    expect(Sticker::query()->where('type', Sticker::TYPE_SPECIAL)->exists())->toBeTrue();
    expect(Sticker::query()->where('type', Sticker::TYPE_TEAM)->exists())->toBeTrue();

    expect(Sticker::query()->where('rarity', Sticker::RARITY_COMMON)->exists())->toBeTrue();
    expect(Sticker::query()->where('rarity', Sticker::RARITY_RARE)->exists())->toBeTrue();
    expect(Sticker::query()->where('rarity', Sticker::RARITY_EPIC)->exists())->toBeTrue();
    expect(Sticker::query()->where('rarity', Sticker::RARITY_LEGENDARY)->exists())->toBeTrue();
});

it('seeds reward codes, social missions and realistic achievements', function (): void {
    $codes = RewardCode::query()->pluck('code')->all();

    expect($codes)->toContain('MAHA10');
    expect($codes)->toContain('TREINOFORTE');
    expect($codes)->toContain('RESENHAMAHA');

    expect(SocialMission::query()->where('status', SocialMission::STATUS_ACTIVE)->count())->toBeGreaterThanOrEqual(3);

    $achievementNames = Achievement::query()->pluck('name')->all();

    expect($achievementNames)->toContain('Primeira Figurinha');
    expect($achievementNames)->toContain('Pacote Aberto');
    expect($achievementNames)->toContain('Embaixador MAHA');
});

it('admin can access players and stickers admin pages and participant sees realistic album catalog', function (): void {
    $admin = makeStage9Admin();
    $participant = makeStage9Participant();

    $this->actingAs($admin)->get('/admin/players')->assertOk();
    $this->actingAs($admin)->get('/admin/stickers')->assertOk();

    $this->actingAs($participant)
        ->get('/album')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('album/index')
            ->where('progress.total', fn ($total) => is_int($total) && $total >= 25));
});

it('participant can access share cards and generated card payload contains realistic copy', function (): void {
    $participant = makeStage9Participant();

    $this->actingAs($participant)->get('/share-cards')->assertOk();

    $this->actingAs($participant)->post('/share-cards', [
        'type' => 'album_progress',
    ])->assertRedirect();

    $card = ShareCard::query()->where('user_id', $participant->id)->latest('id')->firstOrFail();

    expect((string) ($card->payload['share_copy'] ?? ''))->toContain('Álbum da Copa AAPH');
    expect((string) ($card->payload['share_copy'] ?? ''))->toContain('presença');

    $achievement = Achievement::query()->where('slug', 'primeira-figurinha')->firstOrFail();

    UserAchievement::query()->create([
        'user_id' => $participant->id,
        'achievement_id' => $achievement->id,
        'album_id' => Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail()->id,
        'unlocked_at' => now(),
        'source' => 'seed',
    ]);

    $this->actingAs($participant)->post('/share-cards', [
        'type' => 'achievement_unlocked',
        'achievement_id' => $achievement->id,
    ])->assertRedirect();

    $achievementCard = ShareCard::query()->where('user_id', $participant->id)->where('type', 'achievement_unlocked')->latest('id')->firstOrFail();
    expect((string) ($achievementCard->payload['share_copy'] ?? ''))->toContain('conquista');
});

it('maha10 redeem and open flow unlocks album stickers for participant', function (): void {
    $participant = makeStage9Participant();

    $this->actingAs($participant)->post('/reward-code', [
        'code' => 'MAHA10',
    ])->assertRedirect('/reward-code');

    $pack = StickerPack::query()
        ->where('user_id', $participant->id)
        ->where('source', StickerPack::SOURCE_REWARD_CODE)
        ->latest('id')
        ->firstOrFail();

    $this->actingAs($participant)->post("/packs/{$pack->id}/open")->assertRedirect();

    $pack->refresh();

    expect($pack->status)->toBe(StickerPack::STATUS_OPENED);

    $this->actingAs($participant)
        ->get('/album')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('album/index')
            ->where('progress.unlocked', fn ($unlocked) => is_int($unlocked) && $unlocked > 0));
});

it('participant submission approved by admin generates social mission pack', function (): void {
    $admin = makeStage9Admin();
    $participant = makeStage9Participant();

    $mission = SocialMission::query()->where('slug', 'postar-story-marcando-time')->firstOrFail();

    $this->actingAs($participant)->post("/social-missions/{$mission->id}/submissions", [
        'evidence_text' => 'Story publicado e time marcado para a demo.',
    ])->assertRedirect();

    $submission = SocialMissionSubmission::query()->where('user_id', $participant->id)->where('social_mission_id', $mission->id)->latest('id')->firstOrFail();

    $this->actingAs($admin)->patch("/admin/social-mission-submissions/{$submission->id}/approve", [
        'note' => 'Aprovado para demo',
    ])->assertRedirect();

    expect(StickerPack::query()->where('social_mission_submission_id', $submission->id)->where('source', StickerPack::SOURCE_SOCIAL_MISSION)->exists())->toBeTrue();
});
