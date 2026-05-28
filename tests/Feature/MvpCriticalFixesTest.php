<?php

use App\Models\Album;
use App\Models\Player;
use App\Models\RewardCode;
use App\Models\Role;
use App\Models\Sticker;
use App\Models\StickerPack;
use App\Models\StickerPackItem;
use App\Models\Team;
use App\Models\User;
use App\Models\UserSticker;
use App\Services\Rankings\BuildAlbumRankingService;
use App\Services\Stickers\StickerImageResolver;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
});

function makeCriticalParticipant(): User
{
    $user = User::factory()->create();
    $user->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    return $user;
}

it('supports album with multiple teams and sums total stickers in collection progress', function (): void {
    $participant = makeCriticalParticipant();

    $teamA = Team::factory()->create(['name' => 'Team Alpha', 'slug' => 'alpha']);
    $teamB = Team::factory()->create(['name' => 'Team Beta', 'slug' => 'beta']);

    $album = Album::factory()->active()->create([
        'team_id' => $teamA->id,
        'name' => 'Album Multi Team',
        'slug' => 'album-multi-team',
    ]);

    $album->teams()->sync([$teamA->id, $teamB->id]);

    Album::query()
        ->where('id', '!=', $album->id)
        ->update(['status' => Album::STATUS_ARCHIVED]);

    $playerA = Player::factory()->create(['team_id' => $teamA->id, 'name' => 'Player Alpha']);
    $playerB = Player::factory()->create(['team_id' => $teamB->id, 'name' => 'Player Beta']);

    $stickerA = Sticker::factory()->create([
        'album_id' => $album->id,
        'player_id' => $playerA->id,
        'code' => 'ALP-001',
        'is_active' => true,
    ]);

    Sticker::factory()->create([
        'album_id' => $album->id,
        'player_id' => $playerB->id,
        'code' => 'BET-001',
        'is_active' => true,
    ]);

    UserSticker::query()->create([
        'user_id' => $participant->id,
        'sticker_id' => $stickerA->id,
        'source' => 'seed',
        'source_id' => null,
        'unlocked_at' => now(),
        'created_at' => now(),
    ]);

    $this->actingAs($participant)
        ->get('/album')
        ->assertOk()
        ->assertSee('"total":2', false)
        ->assertSee('"unlocked":1', false);
});

it('resolves sticker image by team and player slug and falls back to padrao', function (): void {
    $team = Team::factory()->create(['slug' => 'maha-test']);
    $album = Album::factory()->active()->create(['team_id' => $team->id]);
    $album->teams()->syncWithoutDetaching([$team->id]);

    $playerWithImage = Player::factory()->create([
        'team_id' => $team->id,
        'name' => 'Joao Silva',
    ]);

    $playerWithoutImage = Player::factory()->create([
        'team_id' => $team->id,
        'name' => 'Pedro Sem Foto',
    ]);

    $stickerWithImage = Sticker::factory()->create([
        'album_id' => $album->id,
        'player_id' => $playerWithImage->id,
    ]);

    $stickerWithoutImage = Sticker::factory()->create([
        'album_id' => $album->id,
        'player_id' => $playerWithoutImage->id,
    ]);

    $folder = public_path('stickers/'.$team->slug);

    if (! is_dir($folder)) {
        mkdir($folder, 0777, true);
    }

    file_put_contents(
        $folder.'/'.Str::slug($playerWithImage->name).'.png',
        base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5XlXQAAAAASUVORK5CYII='),
    );

    $resolver = app(StickerImageResolver::class);

    expect($resolver->resolve($stickerWithImage))->toContain('/stickers/'.$team->slug.'/'.Str::slug($playerWithImage->name).'.png');
    expect($resolver->resolve($stickerWithoutImage))->toContain('/stickers/padrao.png');
});

it('shows fallback sticker image in opened pack details', function (): void {
    $participant = makeCriticalParticipant();
    $album = Album::query()->where('status', Album::STATUS_ACTIVE)->firstOrFail();

    $team = Team::factory()->create(['slug' => 'pack-test']);
    $album->teams()->syncWithoutDetaching([$team->id]);

    $player = Player::factory()->create([
        'team_id' => $team->id,
        'name' => 'Sem Imagem Pack',
    ]);

    $sticker = Sticker::factory()->create([
        'album_id' => $album->id,
        'player_id' => $player->id,
        'code' => 'PK-001',
    ]);

    $pack = StickerPack::factory()->create([
        'user_id' => $participant->id,
        'album_id' => $album->id,
        'status' => StickerPack::STATUS_OPENED,
    ]);

    StickerPackItem::query()->create([
        'sticker_pack_id' => $pack->id,
        'sticker_id' => $sticker->id,
        'created_at' => now(),
    ]);

    $this->actingAs($participant)
        ->get("/packs/{$pack->id}")
        ->assertOk()
        ->assertSee('stickers\\/padrao.png', false);
});

it('validates reward code by album scope', function (): void {
    $participant = makeCriticalParticipant();

    $teamA = Team::factory()->create();
    $teamB = Team::factory()->create();

    $albumA = Album::factory()->active()->create(['team_id' => $teamA->id]);
    $albumA->teams()->syncWithoutDetaching([$teamA->id]);

    $albumB = Album::factory()->active()->create(['team_id' => $teamB->id]);
    $albumB->teams()->syncWithoutDetaching([$teamB->id]);

    $code = RewardCode::factory()->active()->create([
        'album_id' => $albumA->id,
        'team_id' => $teamA->id,
        'code' => 'ALBUMA10',
        'max_total_redemptions' => null,
        'max_redemptions_per_user' => 1,
    ]);

    $this->actingAs($participant)
        ->from('/reward-code')
        ->post('/reward-code', [
            'code' => $code->code,
            'album_id' => $albumB->id,
        ])
        ->assertSessionHasErrors('code');
});

it('approval endpoint reflects approved status after admin approval', function (): void {
    $admin = User::factory()->create();
    $admin->roles()->sync([Role::query()->where('slug', 'admin')->firstOrFail()->id]);

    $participant = User::factory()->pendingApproval()->create();
    $participant->roles()->sync([Role::query()->where('slug', 'participant')->firstOrFail()->id]);

    $this->actingAs($admin)
        ->patchJson("/admin/users/{$participant->id}/approve")
        ->assertOk()
        ->assertJsonPath('approval_status', User::APPROVAL_APPROVED);

    $this->actingAs($participant->fresh())
        ->getJson('/approval/status')
        ->assertOk()
        ->assertJsonPath('approval_status', User::APPROVAL_APPROVED)
        ->assertJsonPath('is_approved', true);
});

it('builds ranking by active album scope with stickers from all linked teams', function (): void {
    $teamA = Team::factory()->create(['slug' => 'rank-a']);
    $teamB = Team::factory()->create(['slug' => 'rank-b']);

    $album = Album::factory()->active()->create([
        'team_id' => $teamA->id,
        'name' => 'Ranking Album',
        'slug' => 'ranking-album',
    ]);

    $album->teams()->sync([$teamA->id, $teamB->id]);

    Album::query()
        ->where('id', '!=', $album->id)
        ->update(['status' => Album::STATUS_ARCHIVED]);

    $playerA = Player::factory()->create(['team_id' => $teamA->id]);
    $playerB = Player::factory()->create(['team_id' => $teamB->id]);

    $stickerA = Sticker::factory()->create(['album_id' => $album->id, 'player_id' => $playerA->id, 'code' => 'RA-001']);
    $stickerB = Sticker::factory()->create(['album_id' => $album->id, 'player_id' => $playerB->id, 'code' => 'RB-001']);

    $participant = makeCriticalParticipant();

    UserSticker::query()->create([
        'user_id' => $participant->id,
        'sticker_id' => $stickerA->id,
        'source' => 'seed',
        'source_id' => null,
        'unlocked_at' => now(),
        'created_at' => now(),
    ]);

    UserSticker::query()->create([
        'user_id' => $participant->id,
        'sticker_id' => $stickerB->id,
        'source' => 'seed',
        'source_id' => null,
        'unlocked_at' => now(),
        'created_at' => now(),
    ]);

    $result = app(BuildAlbumRankingService::class)->build($album, false);
    $row = $result['rows']->firstWhere('user_id', $participant->id);

    expect($row)->not->toBeNull();
    expect($row['total_stickers'])->toBe(2);
    expect($row['stickers_unlocked_count'])->toBe(2);
});
