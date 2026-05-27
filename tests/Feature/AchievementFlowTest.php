<?php

use App\Models\Achievement;
use App\Models\Album;
use App\Models\Role;
use App\Models\ShareCard;
use App\Models\User;
use App\Models\UserAchievement;
use App\Models\UserSticker;
use App\Services\Achievements\EvaluateUserAchievementsService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeStage7Admin(): User
{
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    return $admin;
}

function makeStage7Participant(): User
{
    $participant = User::factory()->create();
    $participant->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $participant;
}

it('admin can access achievements index and participant cannot', function (): void {
    $admin = makeStage7Admin();
    $participant = makeStage7Participant();

    $this->actingAs($admin)->get('/admin/achievements')->assertOk();
    $this->actingAs($participant)->get('/admin/achievements')->assertForbidden();
});

it('admin creates and updates achievement with audit logs', function (): void {
    $admin = makeStage7Admin();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $this->actingAs($admin)->post('/admin/achievements', [
        'team_id' => $album->team_id,
        'album_id' => $album->id,
        'name' => 'Conquista de teste',
        'slug' => 'conquista-de-teste',
        'description' => 'desc',
        'type' => Achievement::TYPE_STICKERS_UNLOCKED,
        'threshold' => 2,
        'icon' => 'badge',
        'color' => '#111111',
        'is_active' => true,
        'sort_order' => 999,
    ])->assertRedirect();

    $achievement = Achievement::query()->where('slug', 'conquista-de-teste')->firstOrFail();

    $this->actingAs($admin)->patch("/admin/achievements/{$achievement->id}", [
        'team_id' => $album->team_id,
        'album_id' => $album->id,
        'name' => 'Conquista de teste atualizada',
        'slug' => 'conquista-de-teste-atualizada',
        'description' => 'desc 2',
        'type' => Achievement::TYPE_STICKERS_UNLOCKED,
        'threshold' => 3,
        'icon' => 'badge',
        'color' => '#222222',
        'is_active' => true,
        'sort_order' => 998,
    ])->assertRedirect();

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'achievement.created',
        'entity_id' => $achievement->id,
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'achievement.updated',
        'entity_id' => $achievement->id,
    ]);
});

it('evaluation unlocks first sticker achievement and does not duplicate it', function (): void {
    $participant = makeStage7Participant();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();
    $stickerId = $album->stickers()->where('is_active', true)->value('id');

    UserSticker::query()->create([
        'user_id' => $participant->id,
        'sticker_id' => $stickerId,
        'source' => 'seed',
        'source_id' => null,
        'unlocked_at' => now(),
        'created_at' => now(),
    ]);

    app(EvaluateUserAchievementsService::class)->evaluate($participant, $album);
    app(EvaluateUserAchievementsService::class)->evaluate($participant, $album);

    $achievement = Achievement::query()->where('slug', 'primeira-figurinha')->firstOrFail();

    expect(UserAchievement::query()->where('user_id', $participant->id)->where('achievement_id', $achievement->id)->count())->toBe(1);

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'achievement.unlocked',
        'entity_id' => $achievement->id,
    ]);

    $this->assertDatabaseHas('share_cards', [
        'user_id' => $participant->id,
        'type' => ShareCard::TYPE_ACHIEVEMENT_UNLOCKED,
    ]);
});

it('admin grants achievement manually and audits grant', function (): void {
    $admin = makeStage7Admin();
    $participant = makeStage7Participant();
    $achievement = Achievement::query()->where('slug', 'codigo-resgatado')->firstOrFail();

    $this->actingAs($admin)->post("/admin/achievements/{$achievement->id}/grant", [
        'user_id' => $participant->id,
        'note' => 'Concessão manual de teste',
    ])->assertRedirect();

    $this->assertDatabaseHas('user_achievements', [
        'user_id' => $participant->id,
        'achievement_id' => $achievement->id,
        'source' => UserAchievement::SOURCE_ADMIN,
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'achievement.granted',
        'entity_id' => $achievement->id,
        'target_user_id' => $participant->id,
    ]);
});
