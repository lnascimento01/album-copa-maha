<?php

namespace App\Services\Achievements;

use App\Models\Achievement;
use App\Models\ActivityCheckin;
use App\Models\Album;
use App\Models\RewardCodeRedemption;
use App\Models\SocialMissionSubmission;
use App\Models\StickerPack;
use App\Models\User;
use App\Models\UserAchievement;
use App\Models\UserSticker;
use App\Services\Audit\AuditLogger;
use App\Services\ShareCards\CreateShareCardService;
use Illuminate\Support\Collection;

class EvaluateUserAchievementsService
{
    public function __construct(
        private readonly AuditLogger $auditLogger,
        private readonly CreateShareCardService $createShareCardService,
    ) {}

    /**
     * @return array{album: Album|null, metrics: array<string, int>, unlocked: Collection<int, UserAchievement>}
     */
    public function evaluate(User $user, ?Album $album = null): array
    {
        $album ??= Album::query()->where('status', Album::STATUS_ACTIVE)->first();

        if (! $album) {
            return [
                'album' => null,
                'metrics' => [
                    'stickers_unlocked' => 0,
                    'total_stickers' => 0,
                    'album_progress_percent' => 0,
                    'packs_opened' => 0,
                    'checkins_confirmed' => 0,
                    'reward_codes_redeemed' => 0,
                    'social_missions_approved' => 0,
                ],
                'unlocked' => collect(),
            ];
        }

        $metrics = $this->buildMetrics($user, $album);

        $achievements = Achievement::query()
            ->where('is_active', true)
            ->where(function ($query) use ($album) {
                $query->whereNull('team_id')
                    ->orWhere('team_id', $album->team_id);
            })
            ->where(function ($query) use ($album) {
                $query->whereNull('album_id')
                    ->orWhere('album_id', $album->id);
            })
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $unlocked = collect();

        foreach ($achievements as $achievement) {
            if (! $this->meetsCriteria($achievement, $metrics)) {
                continue;
            }

            $achievementAlbumId = $this->resolveAchievementAlbumId($achievement, $album);

            $exists = UserAchievement::query()
                ->where('user_id', $user->id)
                ->where('achievement_id', $achievement->id)
                ->where('album_id', $achievementAlbumId)
                ->exists();

            if ($exists) {
                continue;
            }

            $entry = UserAchievement::query()->create([
                'user_id' => $user->id,
                'achievement_id' => $achievement->id,
                'album_id' => $achievementAlbumId,
                'unlocked_at' => now(),
                'source' => UserAchievement::SOURCE_EVALUATOR,
                'metadata' => [
                    'type' => $achievement->type,
                    'threshold' => $achievement->threshold,
                    'metrics' => $metrics,
                ],
            ]);

            $this->auditLogger->log(
                action: 'achievement.unlocked',
                actor: $user,
                target: $user,
                entityType: Achievement::class,
                entityId: $achievement->id,
                metadata: [
                    'achievement_id' => $achievement->id,
                    'achievement_slug' => $achievement->slug,
                    'album_id' => $achievementAlbumId,
                    'source' => UserAchievement::SOURCE_EVALUATOR,
                ],
            );

            $this->createShareCardService->createForUser(
                user: $user,
                type: 'achievement_unlocked',
                album: $album,
                title: 'Nova conquista desbloqueada',
                subtitle: $achievement->name,
                metric: $achievement->threshold,
                related: [
                    'achievement_id' => $achievement->id,
                    'user_achievement_id' => $entry->id,
                ],
            );

            $unlocked->push($entry);
        }

        return [
            'album' => $album,
            'metrics' => $metrics,
            'unlocked' => $unlocked,
        ];
    }

    /**
     * @return array<string, int>
     */
    private function buildMetrics(User $user, Album $album): array
    {
        $activeStickerIds = $album->stickers()->where('is_active', true)->pluck('id');
        $totalStickers = $activeStickerIds->count();

        $stickersUnlocked = UserSticker::query()
            ->where('user_id', $user->id)
            ->whereIn('sticker_id', $activeStickerIds)
            ->count();

        $progressPercent = $totalStickers > 0
            ? (int) floor(($stickersUnlocked / $totalStickers) * 100)
            : 0;

        $packsOpened = StickerPack::query()
            ->where('user_id', $user->id)
            ->where('album_id', $album->id)
            ->where('status', StickerPack::STATUS_OPENED)
            ->count();

        $checkinsConfirmed = ActivityCheckin::query()
            ->where('user_id', $user->id)
            ->where('status', ActivityCheckin::STATUS_CONFIRMED)
            ->whereHas('activity', fn ($query) => $query->where('album_id', $album->id))
            ->count();

        $rewardCodesRedeemed = RewardCodeRedemption::query()
            ->where('user_id', $user->id)
            ->whereHas('rewardCode', fn ($query) => $query->where('album_id', $album->id))
            ->count();

        $socialMissionsApproved = SocialMissionSubmission::query()
            ->where('user_id', $user->id)
            ->where('status', SocialMissionSubmission::STATUS_APPROVED)
            ->whereHas('mission', fn ($query) => $query->where('album_id', $album->id))
            ->count();

        return [
            'stickers_unlocked' => $stickersUnlocked,
            'total_stickers' => $totalStickers,
            'album_progress_percent' => $progressPercent,
            'packs_opened' => $packsOpened,
            'checkins_confirmed' => $checkinsConfirmed,
            'reward_codes_redeemed' => $rewardCodesRedeemed,
            'social_missions_approved' => $socialMissionsApproved,
        ];
    }

    /**
     * @param  array<string, int>  $metrics
     */
    private function meetsCriteria(Achievement $achievement, array $metrics): bool
    {
        if ($achievement->type === Achievement::TYPE_SPECIAL) {
            return false;
        }

        $threshold = (int) ($achievement->threshold ?? 0);

        if ($threshold < 1) {
            return false;
        }

        return match ($achievement->type) {
            Achievement::TYPE_ALBUM_PROGRESS => $metrics['album_progress_percent'] >= $threshold,
            Achievement::TYPE_STICKERS_UNLOCKED => $metrics['stickers_unlocked'] >= $threshold,
            Achievement::TYPE_PACKS_OPENED => $metrics['packs_opened'] >= $threshold,
            Achievement::TYPE_CHECKINS_CONFIRMED => $metrics['checkins_confirmed'] >= $threshold,
            Achievement::TYPE_REWARD_CODES_REDEEMED => $metrics['reward_codes_redeemed'] >= $threshold,
            Achievement::TYPE_SOCIAL_MISSIONS_APPROVED => $metrics['social_missions_approved'] >= $threshold,
            default => false,
        };
    }

    private function resolveAchievementAlbumId(Achievement $achievement, Album $album): ?int
    {
        if ($achievement->album_id !== null) {
            return $achievement->album_id;
        }

        return $album->id;
    }
}
