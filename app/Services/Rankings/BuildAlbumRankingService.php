<?php

namespace App\Services\Rankings;

use App\Models\ActivityCheckin;
use App\Models\Album;
use App\Models\RewardCodeRedemption;
use App\Models\SocialMissionSubmission;
use App\Models\StickerPack;
use App\Models\User;
use App\Models\UserAchievement;
use App\Models\UserSticker;
use Illuminate\Support\Collection;

class BuildAlbumRankingService
{
    /**
     * Human-readable label for each pack source shown in the score breakdown.
     * Order here is the display order of the breakdown lines.
     */
    private const SOURCE_LABELS = [
        'social_mission' => 'Missão social',
        'pool' => 'Bolão',
        'bonus' => 'Bônus de boas-vindas',
        'reward_code' => 'Código de recompensa',
        'admin' => 'Concedido pela organização',
        'seed' => 'Pacote inicial',
    ];

    /**
     * @return array{album: Album|null, rows: Collection<int, array<string, mixed>>, formula: string}
     */
    public function build(?Album $album = null, bool $includeAdmins = false): array
    {
        $album ??= Album::query()->where('status', Album::STATUS_ACTIVE)->first();

        if (! $album) {
            return [
                'album' => null,
                'rows' => collect(),
                'formula' => $this->formula(),
            ];
        }

        $activeStickerIds = $album->collectibleStickersQuery()->pluck('id');
        $totalStickers = $activeStickerIds->count();

        $users = User::query()
            ->where('approval_status', User::APPROVAL_APPROVED)
            ->when(! $includeAdmins, fn ($query) => $query->whereDoesntHave('roles', fn ($roleQuery) => $roleQuery->where('slug', 'admin')))
            ->get(['id', 'name', 'email']);

        // Pre-aggregated maps so the score breakdown can attribute each point to
        // the action that earned it, without an extra query per user per source.
        // Distinct collectible stickers a user owns, grouped by the source of the
        // pack they came from (no duplicates exist, so each sticker maps to one).
        $stickersBySource = UserSticker::query()
            ->join('sticker_packs', 'sticker_packs.id', '=', 'user_stickers.source_id')
            ->where('user_stickers.source', 'pack')
            ->where('sticker_packs.album_id', $album->id)
            ->whereIn('user_stickers.sticker_id', $activeStickerIds)
            ->selectRaw('user_stickers.user_id as uid, sticker_packs.source as src, COUNT(DISTINCT user_stickers.sticker_id) as figs')
            ->groupBy('user_stickers.user_id', 'sticker_packs.source')
            ->get()
            ->groupBy('uid');

        // Opened packs per user, grouped by source.
        $packsBySource = StickerPack::query()
            ->where('album_id', $album->id)
            ->where('status', StickerPack::STATUS_OPENED)
            ->selectRaw('user_id as uid, source as src, COUNT(*) as packs')
            ->groupBy('user_id', 'source')
            ->get()
            ->groupBy('uid');

        // Stickers seeded directly (not opened from a pack).
        $seedStickersByUser = UserSticker::query()
            ->where('source', 'seed')
            ->whereIn('sticker_id', $activeStickerIds)
            ->selectRaw('user_id as uid, COUNT(DISTINCT sticker_id) as figs')
            ->groupBy('user_id')
            ->get()
            ->keyBy('uid');

        $rows = $users->map(function (User $user) use ($album, $activeStickerIds, $totalStickers, $stickersBySource, $packsBySource, $seedStickersByUser): array {
            $stickersUnlockedCount = UserSticker::query()
                ->where('user_id', $user->id)
                ->whereIn('sticker_id', $activeStickerIds)
                ->distinct('sticker_id')
                ->count('sticker_id');

            $packsOpenedCount = StickerPack::query()
                ->where('user_id', $user->id)
                ->where('album_id', $album->id)
                ->where('status', StickerPack::STATUS_OPENED)
                ->count();

            $checkinsConfirmedCount = ActivityCheckin::query()
                ->where('user_id', $user->id)
                ->where('status', ActivityCheckin::STATUS_CONFIRMED)
                ->whereHas('activity', fn ($query) => $query->where('album_id', $album->id))
                ->count();

            $rewardCodesRedeemedCount = RewardCodeRedemption::query()
                ->where('user_id', $user->id)
                ->whereHas('rewardCode', fn ($query) => $query->where('album_id', $album->id))
                ->count();

            $socialMissionsApprovedCount = SocialMissionSubmission::query()
                ->where('user_id', $user->id)
                ->where('status', SocialMissionSubmission::STATUS_APPROVED)
                ->whereHas('mission', fn ($query) => $query->where('album_id', $album->id))
                ->count();

            $achievementsCount = UserAchievement::query()
                ->where('user_id', $user->id)
                ->where(function ($query) use ($album) {
                    $query->whereNull('album_id')
                        ->orWhere('album_id', $album->id);
                })
                ->count();

            $progressPercent = $totalStickers > 0
                ? (int) floor(($stickersUnlockedCount / $totalStickers) * 100)
                : 0;

            $score = ($stickersUnlockedCount * 10)
                + ($packsOpenedCount * 3)
                + ($checkinsConfirmedCount * 5)
                + ($rewardCodesRedeemedCount * 2)
                + ($socialMissionsApprovedCount * 5)
                + ($achievementsCount * 8);

            $breakdown = $this->buildBreakdown(
                figsBySource: $stickersBySource->get($user->id, collect())->keyBy('src'),
                packsBySource: $packsBySource->get($user->id, collect())->keyBy('src'),
                seedStickers: (int) ($seedStickersByUser->get($user->id)->figs ?? 0),
                socialMissionsApproved: $socialMissionsApprovedCount,
                achievements: $achievementsCount,
                checkins: $checkinsConfirmedCount,
                rewardCodes: $rewardCodesRedeemedCount,
            );

            return [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_email' => $user->email,
                'stickers_unlocked_count' => $stickersUnlockedCount,
                'total_stickers' => $totalStickers,
                'album_progress_percent' => $progressPercent,
                'packs_opened_count' => $packsOpenedCount,
                'checkins_confirmed_count' => $checkinsConfirmedCount,
                'reward_codes_redeemed_count' => $rewardCodesRedeemedCount,
                'social_missions_approved_count' => $socialMissionsApprovedCount,
                'achievements_count' => $achievementsCount,
                'score' => $score,
                'breakdown' => $breakdown,
            ];
        })->sortByDesc('score')->values();

        $position = 1;
        $ranked = $rows->map(function (array $row) use (&$position): array {
            $row['position'] = $position;
            $position++;

            return $row;
        });

        return [
            'album' => $album,
            'rows' => $ranked,
            'formula' => $this->formula(),
        ];
    }

    /**
     * Build the per-action point breakdown. The sum of the line points always
     * equals the row score, so the UI can show exactly where the points came
     * from (e.g. "Missão social — 15 figurinhas, 6 pacotes — +183 pts").
     *
     * @param  Collection<string, mixed>  $figsBySource
     * @param  Collection<string, mixed>  $packsBySource
     * @return array<int, array<string, mixed>>
     */
    private function buildBreakdown(
        Collection $figsBySource,
        Collection $packsBySource,
        int $seedStickers,
        int $socialMissionsApproved,
        int $achievements,
        int $checkins,
        int $rewardCodes,
    ): array {
        $sources = collect(array_keys(self::SOURCE_LABELS))
            ->merge($packsBySource->keys())
            ->merge($figsBySource->keys())
            ->unique();

        $lines = [];

        foreach ($sources as $src) {
            $figs = (int) ($figsBySource->get($src)->figs ?? 0);
            $packs = (int) ($packsBySource->get($src)->packs ?? 0);
            $missions = $src === 'social_mission' ? $socialMissionsApproved : 0;

            if ($figs === 0 && $packs === 0 && $missions === 0) {
                continue;
            }

            $lines[] = [
                'key' => $src,
                'label' => self::SOURCE_LABELS[$src] ?? ucfirst(str_replace('_', ' ', $src)),
                'stickers' => $figs,
                'packs' => $packs,
                'missions' => $missions,
                'points' => $figs * 10 + $packs * 3 + $missions * 5,
            ];
        }

        if ($seedStickers > 0) {
            $lines[] = ['key' => 'initial', 'label' => 'Figurinhas iniciais', 'stickers' => $seedStickers, 'packs' => 0, 'missions' => 0, 'points' => $seedStickers * 10];
        }

        if ($achievements > 0) {
            $lines[] = ['key' => 'achievements', 'label' => 'Conquistas', 'stickers' => 0, 'packs' => 0, 'missions' => 0, 'points' => $achievements * 8];
        }

        if ($checkins > 0) {
            $lines[] = ['key' => 'checkins', 'label' => 'Check-ins confirmados', 'stickers' => 0, 'packs' => 0, 'missions' => 0, 'points' => $checkins * 5];
        }

        if ($rewardCodes > 0) {
            $lines[] = ['key' => 'reward_codes', 'label' => 'Códigos resgatados', 'stickers' => 0, 'packs' => 0, 'missions' => 0, 'points' => $rewardCodes * 2];
        }

        return $lines;
    }

    private function formula(): string
    {
        return 'score = stickers_unlocked*10 + packs_opened*3 + checkins_confirmed*5 + reward_codes_redeemed*2 + social_missions_approved*5 + achievements*8';
    }
}
