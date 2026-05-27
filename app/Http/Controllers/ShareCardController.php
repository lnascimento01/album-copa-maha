<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreShareCardRequest;
use App\Models\Achievement;
use App\Models\Album;
use App\Models\ShareCard;
use App\Models\SocialMissionSubmission;
use App\Models\StickerPack;
use App\Models\User;
use App\Models\UserSticker;
use App\Services\ShareCards\CreateShareCardService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ShareCardController extends Controller
{
    public function __construct(private readonly CreateShareCardService $createShareCardService) {}

    public function index(): Response
    {
        /** @var User $user */
        $user = request()->user();

        abort_unless($user->hasPermission('shareCards.viewOwn'), 403);

        $cards = ShareCard::query()
            ->with(['album:id,name,slug'])
            ->where('user_id', $user->id)
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (ShareCard $card): array => [
                'id' => $card->id,
                'type' => $card->type,
                'title' => $card->title,
                'subtitle' => $card->subtitle,
                'created_at' => optional($card->created_at)?->toDateTimeString(),
                'payload' => $card->payload,
                'album' => $card->album,
            ]);

        return Inertia::render('share-cards/index', [
            'cards' => $cards,
            'types' => ShareCard::TYPES,
        ]);
    }

    public function show(ShareCard $shareCard): Response
    {
        $this->authorize('view', $shareCard);

        $shareCard->load(['album:id,name,slug', 'user:id,name,email']);

        return Inertia::render('share-cards/show', [
            'card' => [
                'id' => $shareCard->id,
                'type' => $shareCard->type,
                'title' => $shareCard->title,
                'subtitle' => $shareCard->subtitle,
                'payload' => $shareCard->payload,
                'created_at' => optional($shareCard->created_at)?->toDateTimeString(),
                'album' => $shareCard->album,
                'user' => $shareCard->user,
            ],
        ]);
    }

    public function store(StoreShareCardRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = request()->user();

        $this->authorize('create', ShareCard::class);

        $type = (string) $request->validated('type');

        $album = Album::query()->where('status', Album::STATUS_ACTIVE)->first();

        if (! $album) {
            return back()->withErrors([
                'card' => 'Nenhum álbum ativo disponível para gerar card.',
            ]);
        }

        [$title, $subtitle, $metric, $related] = $this->resolvePayloadSource($type, $user, $album, $request->validated());

        if ($title === null) {
            return back()->withErrors([
                'card' => 'Não foi possível gerar este card com os dados atuais.',
            ]);
        }

        $card = $this->createShareCardService->createForUser(
            user: $user,
            type: $type,
            album: $album,
            title: $title,
            subtitle: $subtitle,
            metric: $metric,
            related: $related,
        );

        return redirect()->route('share-cards.show', $card)
            ->with('success', 'Card gerado com sucesso.');
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{0: string|null, 1: string|null, 2: int|string|null, 3: array<string, mixed>}
     */
    private function resolvePayloadSource(string $type, User $user, Album $album, array $validated): array
    {
        return match ($type) {
            ShareCard::TYPE_ALBUM_PROGRESS => $this->resolveAlbumProgressPayload($user, $album),
            ShareCard::TYPE_ACHIEVEMENT_UNLOCKED => $this->resolveAchievementPayload($user, $validated),
            ShareCard::TYPE_PACK_OPENED => $this->resolvePackPayload($user),
            ShareCard::TYPE_STICKER_UNLOCKED => $this->resolveStickerPayload($user),
            ShareCard::TYPE_SOCIAL_MISSION_APPROVED => $this->resolveMissionPayload($user),
            default => [null, null, null, []],
        };
    }

    /**
     * @return array{0: string, 1: string, 2: int, 3: array<string, mixed>}
     */
    private function resolveAlbumProgressPayload(User $user, Album $album): array
    {
        $activeStickerIds = $album->stickers()->where('is_active', true)->pluck('id');
        $total = $activeStickerIds->count();

        $unlocked = UserSticker::query()
            ->where('user_id', $user->id)
            ->whereIn('sticker_id', $activeStickerIds)
            ->count();

        $percent = $total > 0 ? (int) floor(($unlocked / $total) * 100) : 0;

        return [
            'Meu progresso da temporada',
            sprintf('%d/%d figurinhas desbloqueadas', $unlocked, $total),
            $percent,
            [
                'unlocked' => $unlocked,
                'total' => $total,
                'percent' => $percent,
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{0: string|null, 1: string|null, 2: int|string|null, 3: array<string, mixed>}
     */
    private function resolveAchievementPayload(User $user, array $validated): array
    {
        $achievementId = isset($validated['achievement_id']) ? (int) $validated['achievement_id'] : null;

        if (! $achievementId) {
            return [null, null, null, []];
        }

        $achievement = Achievement::query()->find($achievementId);

        if (! $achievement) {
            return [null, null, null, []];
        }

        $hasAchievement = $user->userAchievements()
            ->where('achievement_id', $achievement->id)
            ->exists();

        if (! $hasAchievement) {
            return [null, null, null, []];
        }

        return [
            'Nova conquista desbloqueada',
            $achievement->name,
            $achievement->threshold,
            [
                'achievement_id' => $achievement->id,
            ],
        ];
    }

    /**
     * @return array{0: string|null, 1: string|null, 2: int|string|null, 3: array<string, mixed>}
     */
    private function resolvePackPayload(User $user): array
    {
        $pack = StickerPack::query()
            ->where('user_id', $user->id)
            ->where('status', StickerPack::STATUS_OPENED)
            ->orderByDesc('opened_at')
            ->first();

        if (! $pack) {
            return [null, null, null, []];
        }

        return [
            'Mais um pacote aberto',
            sprintf('Pacote #%d com %d figurinhas', $pack->id, $pack->size),
            $pack->size,
            [
                'pack_id' => $pack->id,
            ],
        ];
    }

    /**
     * @return array{0: string|null, 1: string|null, 2: int|string|null, 3: array<string, mixed>}
     */
    private function resolveStickerPayload(User $user): array
    {
        $unlocked = UserSticker::query()
            ->with('sticker:id,code,title')
            ->where('user_id', $user->id)
            ->orderByDesc('unlocked_at')
            ->first();

        if (! $unlocked || ! $unlocked->sticker) {
            return [null, null, null, []];
        }

        return [
            'Nova figurinha desbloqueada',
            sprintf('%s - %s', $unlocked->sticker->code, $unlocked->sticker->title),
            null,
            [
                'sticker_id' => $unlocked->sticker_id,
            ],
        ];
    }

    /**
     * @return array{0: string|null, 1: string|null, 2: int|string|null, 3: array<string, mixed>}
     */
    private function resolveMissionPayload(User $user): array
    {
        $submission = SocialMissionSubmission::query()
            ->with('mission:id,title')
            ->where('user_id', $user->id)
            ->where('status', SocialMissionSubmission::STATUS_APPROVED)
            ->orderByDesc('reviewed_at')
            ->first();

        if (! $submission || ! $submission->mission) {
            return [null, null, null, []];
        }

        return [
            'Missão social aprovada',
            $submission->mission->title,
            null,
            [
                'social_mission_submission_id' => $submission->id,
                'social_mission_id' => $submission->social_mission_id,
            ],
        ];
    }
}
