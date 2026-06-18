<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StickerPack;
use App\Models\StickerPackItem;
use App\Models\User;
use App\Models\UserAchievement;
use App\Models\UserSticker;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserStickerResetController extends Controller
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    public function __invoke(Request $request, User $user): RedirectResponse
    {
        $this->authorize('resetStickers', $user);

        $stickersCount = UserSticker::query()
            ->where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->count();

        $achievementsCount = UserAchievement::query()
            ->where('user_id', $user->id)
            ->count();

        $openedPacksCount = StickerPack::query()
            ->where('user_id', $user->id)
            ->where('status', StickerPack::STATUS_OPENED)
            ->count();

        DB::transaction(function () use ($user): void {
            // Soft-delete sticker records so they can be re-collected after reset
            UserSticker::query()
                ->where('user_id', $user->id)
                ->delete();

            // Remove achievements — they were earned based on sticker progress
            // and would still show as unlocked on the album page and inflate ranking
            UserAchievement::query()
                ->where('user_id', $user->id)
                ->delete();

            $openedPackIds = StickerPack::query()
                ->where('user_id', $user->id)
                ->where('status', StickerPack::STATUS_OPENED)
                ->pluck('id');

            // Clear pack items before reopening so reopen doesn't double-stack old+new items
            StickerPackItem::query()
                ->whereIn('sticker_pack_id', $openedPackIds)
                ->delete();

            // Re-open packs so the user can open them again after the reset
            StickerPack::query()
                ->whereIn('id', $openedPackIds)
                ->update([
                    'status' => StickerPack::STATUS_PENDING,
                    'opened_at' => null,
                ]);
        });

        $this->auditLogger->log(
            action: 'user.stickers_reset',
            actor: $request->user(),
            target: $user,
            metadata: [
                'stickers_soft_deleted' => $stickersCount,
                'achievements_deleted' => $achievementsCount,
                'packs_reopened' => $openedPacksCount,
            ],
            entityType: User::class,
            entityId: $user->id,
        );

        return back()->with('success', "Progresso resetado: {$stickersCount} figurinha(s), {$achievementsCount} conquista(s), {$openedPacksCount} pacote(s) reaberto(s).");
    }
}
