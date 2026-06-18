<?php

namespace App\Services\Stickers;

use App\Models\Achievement;
use App\Models\ActivityCheckin;
use App\Models\Album;
use App\Models\RewardCodeRedemption;
use App\Models\SocialMissionSubmission;
use App\Models\StickerPack;
use App\Models\StickerPackItem;
use App\Models\User;
use App\Models\UserAchievement;
use App\Models\UserSticker;
use App\Services\Audit\AuditLogger;
use Illuminate\Support\Facades\DB;

class RevokePackService
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    public function revoke(StickerPack $pack, User $actor, string $reason): void
    {
        $pack->load(['album', 'user']);

        DB::transaction(function () use ($pack, $actor, $reason): void {
            $deliveredStickerIds = StickerPackItem::query()
                ->where('sticker_pack_id', $pack->id)
                ->pluck('sticker_id')
                ->all();

            // Remove sticker items from the pack
            StickerPackItem::query()
                ->where('sticker_pack_id', $pack->id)
                ->delete();

            // Soft-delete UserSticker rows that came specifically from this pack
            UserSticker::query()
                ->where('user_id', $pack->user_id)
                ->where('source', 'pack')
                ->where('source_id', $pack->id)
                ->delete();

            // Mark pack as cancelled
            $pack->forceFill([
                'status' => StickerPack::STATUS_CANCELLED,
                'cancelled_at' => now(),
                'opened_at' => $pack->status === StickerPack::STATUS_OPENED ? $pack->opened_at : null,
                'cancellation_reason' => $reason,
            ])->save();

            // Re-evaluate achievements: remove any that the user no longer qualifies for
            if ($pack->album && count($deliveredStickerIds) > 0) {
                $this->pruneStaleAchievements($pack->user, $pack->album);
            }

            $this->auditLogger->log(
                action: 'sticker_pack.revoked',
                actor: $actor,
                target: $pack->user,
                entityType: StickerPack::class,
                entityId: $pack->id,
                metadata: [
                    'pack_id' => $pack->id,
                    'album_id' => $pack->album_id,
                    'user_id' => $pack->user_id,
                    'previous_status' => $pack->getOriginal('status'),
                    'delivered_sticker_ids' => $deliveredStickerIds,
                    'reason' => $reason,
                ],
            );
        });
    }

    private function pruneStaleAchievements(User $user, Album $album): void
    {
        $metrics = $this->buildMetrics($user, $album);

        $userAchievements = UserAchievement::query()
            ->where('user_id', $user->id)
            ->with('achievement')
            ->get();

        foreach ($userAchievements as $ua) {
            $achievement = $ua->achievement;

            if (! $achievement || ! $achievement->is_active) {
                continue;
            }

            if (! $this->stillMeetsCriteria($achievement, $metrics)) {
                $ua->delete();
            }
        }
    }

    /**
     * @return array<string, int>
     */
    private function buildMetrics(User $user, Album $album): array
    {
        $activeStickerIds = $album->collectibleStickersQuery()->pluck('id');
        $totalStickers = $activeStickerIds->count();

        $stickersUnlocked = UserSticker::query()
            ->where('user_id', $user->id)
            ->whereIn('sticker_id', $activeStickerIds)
            ->distinct('sticker_id')
            ->count('sticker_id');

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
            ->whereHas('activity', fn ($q) => $q->where('album_id', $album->id))
            ->count();

        $rewardCodesRedeemed = RewardCodeRedemption::query()
            ->where('user_id', $user->id)
            ->whereHas('rewardCode', fn ($q) => $q->where('album_id', $album->id))
            ->count();

        $socialMissionsApproved = SocialMissionSubmission::query()
            ->where('user_id', $user->id)
            ->where('status', SocialMissionSubmission::STATUS_APPROVED)
            ->whereHas('mission', fn ($q) => $q->where('album_id', $album->id))
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
     * @param array<string, int> $metrics
     */
    private function stillMeetsCriteria(Achievement $achievement, array $metrics): bool
    {
        if ($achievement->type === Achievement::TYPE_SPECIAL) {
            return true; // special achievements are manually granted, never auto-revoked
        }

        $threshold = (int) ($achievement->threshold ?? 0);

        if ($threshold < 1) {
            return true;
        }

        return match ($achievement->type) {
            Achievement::TYPE_ALBUM_PROGRESS      => $metrics['album_progress_percent'] >= $threshold,
            Achievement::TYPE_STICKERS_UNLOCKED   => $metrics['stickers_unlocked'] >= $threshold,
            Achievement::TYPE_PACKS_OPENED        => $metrics['packs_opened'] >= $threshold,
            Achievement::TYPE_CHECKINS_CONFIRMED  => $metrics['checkins_confirmed'] >= $threshold,
            Achievement::TYPE_REWARD_CODES_REDEEMED => $metrics['reward_codes_redeemed'] >= $threshold,
            Achievement::TYPE_SOCIAL_MISSIONS_APPROVED => $metrics['social_missions_approved'] >= $threshold,
            default => true,
        };
    }
}
