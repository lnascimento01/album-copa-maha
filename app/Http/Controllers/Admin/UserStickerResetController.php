<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserSticker;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserStickerResetController extends Controller
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    public function __invoke(Request $request, User $user): RedirectResponse
    {
        $this->authorize('resetStickers', $user);

        $count = UserSticker::query()
            ->where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->count();

        UserSticker::query()
            ->where('user_id', $user->id)
            ->delete();

        $this->auditLogger->log(
            action: 'user.stickers_reset',
            actor: $request->user(),
            target: $user,
            metadata: [
                'stickers_soft_deleted' => $count,
            ],
            entityType: User::class,
            entityId: $user->id,
        );

        return back()->with('success', "Histórico de {$count} figurinha(s) resetado com soft delete.");
    }
}
