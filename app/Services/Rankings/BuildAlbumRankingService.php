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

        $activeStickerIds = $album->stickers()->where('is_active', true)->pluck('id');
        $totalStickers = $activeStickerIds->count();

        $users = User::query()
            ->where('approval_status', User::APPROVAL_APPROVED)
            ->when(! $includeAdmins, fn ($query) => $query->whereDoesntHave('roles', fn ($roleQuery) => $roleQuery->where('slug', 'admin')))
            ->get(['id', 'name', 'email']);

        $rows = $users->map(function (User $user) use ($album, $activeStickerIds, $totalStickers): array {
            $stickersUnlockedCount = UserSticker::query()
                ->where('user_id', $user->id)
                ->whereIn('sticker_id', $activeStickerIds)
                ->count();

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

    private function formula(): string
    {
        return 'score = stickers_unlocked*10 + packs_opened*3 + checkins_confirmed*5 + reward_codes_redeemed*2 + social_missions_approved*5 + achievements*8';
    }
}
