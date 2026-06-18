<?php

namespace App\Services\Stickers;

use App\Models\Album;
use App\Models\StickerPack;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use Illuminate\Support\Facades\DB;
use Throwable;

class GrantSignupBonusService
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    /**
     * Grant the one-time signup bonus pack(s) to a freshly approved user.
     *
     * Best-effort and idempotent: it never throws to the caller (approval must
     * never be blocked by the bonus) and grants at most one signup bonus per
     * user — re-approvals do not stack.
     *
     * @return int[] IDs of the granted packs ([] when skipped or on failure)
     */
    public function grant(User $user, ?User $actor): array
    {
        try {
            return $this->grantInternal($user, $actor);
        } catch (Throwable $exception) {
            $this->auditLogger->log(
                action: 'sticker_pack.bonus_failed',
                actor: $actor,
                target: $user,
                entityType: User::class,
                entityId: $user->id,
                metadata: ['error' => $exception->getMessage()],
            );

            return [];
        }
    }

    /**
     * @return int[]
     */
    private function grantInternal(User $user, ?User $actor): array
    {
        if (! (bool) config('album.signup_bonus.enabled', true)) {
            return [];
        }

        if (! $user->isApproved()) {
            return [];
        }

        // One signup bonus per user, ever — guards against re-approval stacking.
        $alreadyGranted = StickerPack::query()
            ->where('user_id', $user->id)
            ->where('source', StickerPack::SOURCE_BONUS)
            ->exists();

        if ($alreadyGranted) {
            return [];
        }

        $album = $this->resolveActiveAlbum();

        if (! $album instanceof Album) {
            $this->auditLogger->log(
                action: 'sticker_pack.bonus_skipped',
                actor: $actor,
                target: $user,
                entityType: User::class,
                entityId: $user->id,
                metadata: ['reason' => 'active_album_unresolved'],
            );

            return [];
        }

        $size = $this->clampToPackBounds((int) config('album.signup_bonus.pack_size', 3));
        $quantity = $this->clampToPackBounds((int) config('album.signup_bonus.pack_quantity', 1));

        $packIds = DB::transaction(function () use ($user, $actor, $album, $size, $quantity): array {
            $ids = [];

            for ($i = 0; $i < $quantity; $i++) {
                $pack = StickerPack::query()->create([
                    'user_id' => $user->id,
                    'album_id' => $album->id,
                    'granted_by' => $actor?->id,
                    'source' => StickerPack::SOURCE_BONUS,
                    'status' => StickerPack::STATUS_PENDING,
                    'size' => $size,
                    'metadata' => ['reason' => 'signup_approval_bonus'],
                ]);

                $ids[] = $pack->id;
            }

            return $ids;
        });

        $this->auditLogger->log(
            action: 'sticker_pack.granted_signup_bonus',
            actor: $actor,
            target: $user,
            entityType: StickerPack::class,
            metadata: [
                'target_user_id' => $user->id,
                'album_id' => $album->id,
                'pack_ids' => $packIds,
                'size' => $size,
                'quantity' => $quantity,
                'source' => StickerPack::SOURCE_BONUS,
            ],
        );

        return $packIds;
    }

    /**
     * Resolve the album the bonus belongs to. Prefers an explicitly configured
     * id; otherwise falls back to the single active album. When ambiguous (zero
     * or multiple active albums and no configured id) it returns null so the
     * caller skips the bonus instead of guessing.
     */
    private function resolveActiveAlbum(): ?Album
    {
        $configuredId = config('album.signup_bonus.album_id');

        if (! empty($configuredId)) {
            return Album::query()
                ->whereKey((int) $configuredId)
                ->where('status', Album::STATUS_ACTIVE)
                ->first();
        }

        $activeAlbums = Album::query()
            ->where('status', Album::STATUS_ACTIVE)
            ->orderBy('id')
            ->limit(2)
            ->get();

        return $activeAlbums->count() === 1 ? $activeAlbums->first() : null;
    }

    private function clampToPackBounds(int $value): int
    {
        return max(1, min(10, $value));
    }
}
