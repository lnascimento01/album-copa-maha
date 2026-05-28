<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\StickerPack;
use App\Models\User;
use App\Services\Achievements\EvaluateUserAchievementsService;
use App\Services\ShareCards\CreateShareCardService;
use App\Services\Stickers\Exceptions\StickerPackOpenException;
use App\Services\Stickers\OpenStickerPackService;
use App\Services\Stickers\StickerImageResolver;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StickerPackController extends Controller
{
    public function __construct(
        private readonly OpenStickerPackService $openStickerPackService,
        private readonly EvaluateUserAchievementsService $evaluateUserAchievementsService,
        private readonly CreateShareCardService $createShareCardService,
        private readonly StickerImageResolver $stickerImageResolver,
    ) {}

    public function index(): Response
    {
        /** @var User $user */
        $user = request()->user();

        $pendingPacks = StickerPack::query()
            ->with([
                'album:id,name,slug',
                'activity:id,title,type',
                'rewardCode:id,code,title',
                'socialMission:id,title,slug',
            ])
            ->where('user_id', $user->id)
            ->where('status', StickerPack::STATUS_PENDING)
            ->orderBy('id')
            ->get();

        $historyPacks = StickerPack::query()
            ->with([
                'album:id,name,slug',
                'activity:id,title,type',
                'rewardCode:id,code,title',
                'socialMission:id,title,slug',
            ])
            ->where('user_id', $user->id)
            ->whereIn('status', [StickerPack::STATUS_OPENED, StickerPack::STATUS_CANCELLED])
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        $activeAlbum = Album::query()->where('status', Album::STATUS_ACTIVE)->first();

        $albumStickerCount = $activeAlbum
            ? $activeAlbum->collectibleStickersQuery()->count()
            : 0;

        $unlockedCount = $activeAlbum
            ? (int) $user->userStickers()
                ->whereIn('sticker_id', $activeAlbum->collectibleStickersQuery()->pluck('id'))
                ->distinct('sticker_id')
                ->count('sticker_id')
            : 0;

        return Inertia::render('packs/index', [
            'pendingPacks' => $pendingPacks->map(fn (StickerPack $pack): array => [
                'id' => $pack->id,
                'size' => $pack->size,
                'status' => $pack->status,
                'source' => $pack->source,
                'created_at' => optional($pack->created_at)?->toDateTimeString(),
                'album' => $pack->album,
                'activity' => $pack->activity,
                'reward_code' => $pack->rewardCode,
                'social_mission' => $pack->socialMission,
            ])->values()->all(),
            'historyPacks' => $historyPacks->through(fn (StickerPack $pack): array => [
                'id' => $pack->id,
                'size' => $pack->size,
                'status' => $pack->status,
                'source' => $pack->source,
                'created_at' => optional($pack->created_at)?->toDateTimeString(),
                'opened_at' => optional($pack->opened_at)?->toDateTimeString(),
                'cancelled_at' => optional($pack->cancelled_at)?->toDateTimeString(),
                'album' => $pack->album,
                'activity' => $pack->activity,
                'reward_code' => $pack->rewardCode,
                'social_mission' => $pack->socialMission,
            ]),
            'stats' => [
                'pending' => $pendingPacks->count(),
                'opened' => $user->openedStickerPacks()->count(),
                'unlocked' => $unlockedCount,
                'albumTotal' => $albumStickerCount,
            ],
            'can' => [
                'createShareCard' => $user->hasPermission('shareCards.createOwn'),
            ],
        ]);
    }

    public function show(StickerPack $stickerPack): Response
    {
        /** @var User $user */
        $user = request()->user();

        if ($stickerPack->user_id !== $user->id) {
            abort(403);
        }

        $stickerPack->load([
            'album:id,name,slug',
            'activity:id,title,type,status',
            'rewardCode:id,code,title,status',
            'socialMission:id,title,slug,status',
            'items.sticker:id,code,title,subtitle,type,rarity,image_path',
            'items.sticker.player:id,name,team_id',
            'items.sticker.player.team:id,slug',
        ]);

        return Inertia::render('packs/show', [
            'pack' => [
                'id' => $stickerPack->id,
                'status' => $stickerPack->status,
                'source' => $stickerPack->source,
                'size' => $stickerPack->size,
                'metadata' => $stickerPack->metadata,
                'created_at' => optional($stickerPack->created_at)?->toDateTimeString(),
                'opened_at' => optional($stickerPack->opened_at)?->toDateTimeString(),
                'cancelled_at' => optional($stickerPack->cancelled_at)?->toDateTimeString(),
                'cancellation_reason' => $stickerPack->cancellation_reason,
                'album' => $stickerPack->album,
                'activity' => $stickerPack->activity,
                'reward_code' => $stickerPack->rewardCode,
                'social_mission' => $stickerPack->socialMission,
                'activity_checkin_id' => $stickerPack->activity_checkin_id,
                'items' => $stickerPack->items->map(fn ($item): array => [
                    'id' => $item->id,
                    'sticker' => [
                        'id' => $item->sticker->id,
                        'code' => $item->sticker->code,
                        'title' => $item->sticker->title,
                        'subtitle' => $item->sticker->subtitle,
                        'type' => $item->sticker->type,
                        'rarity' => $item->sticker->rarity,
                        'image_url' => $this->stickerImageResolver->resolve($item->sticker),
                    ],
                ])->values()->all(),
            ],
        ]);
    }

    public function open(StickerPack $stickerPack): RedirectResponse
    {
        /** @var User $user */
        $user = request()->user();

        try {
            $result = $this->openStickerPackService->openForUser($stickerPack->id, $user);
            /** @var StickerPack $openedPack */
            $openedPack = $result['pack'];

            try {
                $this->createShareCardService->createForUser(
                    user: $user,
                    type: 'pack_opened',
                    album: $openedPack->album,
                    title: 'Mais um pacote aberto',
                    subtitle: sprintf('Pacote #%d com %d figurinhas', $openedPack->id, $openedPack->size),
                    metric: count($result['delivered_sticker_ids']),
                    related: [
                        'pack_id' => $openedPack->id,
                        'sticker_ids' => $result['delivered_sticker_ids'],
                    ],
                );

                $this->evaluateUserAchievementsService->evaluate($user, $openedPack->album);
            } catch (\Throwable) {
                // Non-critical side effect: do not interrupt pack opening flow.
            }

            return redirect()->route('packs.show', $stickerPack)->with([
                'success' => 'Pacote aberto com sucesso.',
                'revealedStickerIds' => $result['delivered_sticker_ids'],
            ]);
        } catch (StickerPackOpenException $exception) {
            return back()->withErrors([
                'pack' => $exception->getMessage(),
            ]);
        }
    }
}
