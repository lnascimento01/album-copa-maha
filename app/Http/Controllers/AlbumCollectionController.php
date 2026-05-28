<?php

namespace App\Http\Controllers;

use App\Models\Achievement;
use App\Models\Album;
use App\Models\Sticker;
use App\Models\User;
use App\Services\Stickers\StickerImageResolver;
use Inertia\Inertia;
use Inertia\Response;

class AlbumCollectionController extends Controller
{
    public function __construct(private readonly StickerImageResolver $stickerImageResolver) {}

    public function index(): Response
    {
        /** @var User $user */
        $user = request()->user();

        $album = Album::query()
            ->with([
                'teams:id,name,slug,short_name',
                'team:id,name,slug,short_name',
            ])
            ->where('status', Album::STATUS_ACTIVE)
            ->first();

        if (! $album) {
            return Inertia::render('album/index', [
                'album' => null,
                'progress' => [
                    'total' => 0,
                    'unlocked' => 0,
                    'percent' => 0,
                ],
                'filters' => [],
                'note' => 'MVP da etapa 2 usa o primeiro álbum ativo global. A seleção por time será evoluída na etapa futura.',
            ]);
        }

        $albumStickers = $album->collectibleStickersQuery()
            ->with(['player:id,name,team_id', 'player.team:id,slug'])
            ->orderBy('sort_order')
            ->orderBy('code')
            ->get();

        $unlockedIds = $user->userStickers()
            ->whereIn('sticker_id', $albumStickers->pluck('id'))
            ->pluck('sticker_id')
            ->all();

        $stickers = $albumStickers->map(function (Sticker $sticker) use ($unlockedIds): array {
            $unlocked = in_array($sticker->id, $unlockedIds, true);

            return [
                'id' => $sticker->id,
                'code' => $sticker->code,
                'title' => $unlocked ? $sticker->title : 'Figurinha bloqueada',
                'subtitle' => $unlocked ? $sticker->subtitle : null,
                'description' => $unlocked ? $sticker->description : null,
                'type' => $sticker->type,
                'rarity' => $sticker->rarity,
                'image_url' => $unlocked ? $this->stickerImageResolver->resolve($sticker) : null,
                'is_unlocked' => $unlocked,
            ];
        })->values();

        $total = $stickers->count();
        $unlocked = $stickers->where('is_unlocked', true)->count();
        $pendingPackCount = $user->pendingStickerPacks()
            ->where('album_id', $album->id)
            ->count();

        $progressAchievements = Achievement::query()
            ->where('is_active', true)
            ->where('album_id', $album->id)
            ->where('type', Achievement::TYPE_ALBUM_PROGRESS)
            ->orderBy('threshold')
            ->get()
            ->map(fn (Achievement $achievement): array => [
                'id' => $achievement->id,
                'name' => $achievement->name,
                'threshold' => $achievement->threshold,
                'is_unlocked' => $user->userAchievements()
                    ->where('achievement_id', $achievement->id)
                    ->where('album_id', $album->id)
                    ->exists(),
            ])
            ->values();

        return Inertia::render('album/index', [
            'album' => [
                'id' => $album->id,
                'name' => $album->name,
                'slug' => $album->slug,
                'season' => $album->season,
                'team' => $album->teams->first() ?? $album->team,
                'teams' => $album->teams->map(fn ($team): array => [
                    'id' => $team->id,
                    'name' => $team->name,
                    'slug' => $team->slug,
                    'short_name' => $team->short_name,
                ])->values()->all(),
                'stickers' => $stickers,
            ],
            'progress' => [
                'total' => $total,
                'unlocked' => $unlocked,
                'percent' => $total > 0 ? (int) round(($unlocked / $total) * 100) : 0,
            ],
            'packs' => [
                'pending' => $pendingPackCount,
                'link' => route('packs.index', absolute: false),
            ],
            'can' => [
                'createShareCard' => $user->hasPermission('shareCards.createOwn'),
            ],
            'progressAchievements' => $progressAchievements,
            'filters' => [
                ['label' => 'Todos', 'value' => 'all'],
                ['label' => 'Jogadores', 'value' => 'player'],
                ['label' => 'Goleiros', 'value' => 'goalkeeper'],
                ['label' => 'Comissão', 'value' => 'staff'],
                ['label' => 'Momentos', 'value' => 'moment'],
                ['label' => 'Especiais', 'value' => 'special'],
            ],
            'note' => 'MVP da etapa 2 usa o primeiro álbum ativo global. A seleção por time será evoluída na etapa futura.',
        ]);
    }

    public function show(Sticker $sticker): Response
    {
        /** @var User $user */
        $user = request()->user();

        $sticker->load(['album.teams:id,name,slug,short_name', 'player:id,name,nickname,position,type,team_id', 'player.team:id,slug']);

        if ($sticker->album->status !== Album::STATUS_ACTIVE) {
            abort(404);
        }

        $hasUnlocked = $user->userStickers()->where('sticker_id', $sticker->id)->exists();
        $canSeeFull = $hasUnlocked || $user->hasPermission('stickers.view');

        return Inertia::render('album/show', [
            'sticker' => [
                'id' => $sticker->id,
                'code' => $sticker->code,
                'title' => $canSeeFull ? $sticker->title : 'Figurinha bloqueada',
                'subtitle' => $canSeeFull ? $sticker->subtitle : null,
                'description' => $canSeeFull ? $sticker->description : null,
                'type' => $sticker->type,
                'rarity' => $sticker->rarity,
                'image_url' => $canSeeFull ? $this->stickerImageResolver->resolve($sticker) : null,
                'is_unlocked' => $hasUnlocked,
                'is_full_visible' => $canSeeFull,
                'album' => [
                    'id' => $sticker->album->id,
                    'name' => $sticker->album->name,
                    'slug' => $sticker->album->slug,
                    'teams' => $sticker->album->teams->map(fn ($team): array => [
                        'id' => $team->id,
                        'name' => $team->name,
                    ])->values()->all(),
                ],
                'player' => $canSeeFull ? $sticker->player : null,
            ],
            'note' => 'MVP da etapa 2 usa o primeiro álbum ativo global. A seleção por time será evoluída na etapa futura.',
        ]);
    }
}
