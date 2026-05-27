<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RevokeActivityCheckinRequest;
use App\Http\Requests\StoreActivityCheckinRequest;
use App\Models\Activity;
use App\Models\ActivityCheckin;
use App\Models\Album;
use App\Models\User;
use App\Services\Achievements\EvaluateUserAchievementsService;
use App\Services\Activities\ConfirmActivityCheckinService;
use App\Services\Activities\Exceptions\ActivityCheckinException;
use App\Services\Activities\RevokeActivityCheckinService;
use App\Services\ShareCards\CreateShareCardService;
use Illuminate\Http\RedirectResponse;

class ActivityCheckinController extends Controller
{
    public function __construct(
        private readonly ConfirmActivityCheckinService $confirmActivityCheckinService,
        private readonly RevokeActivityCheckinService $revokeActivityCheckinService,
        private readonly EvaluateUserAchievementsService $evaluateUserAchievementsService,
        private readonly CreateShareCardService $createShareCardService,
    ) {}

    public function store(StoreActivityCheckinRequest $request, Activity $activity): RedirectResponse
    {
        $this->authorize('create', ActivityCheckin::class);

        try {
            $result = $this->confirmActivityCheckinService->confirm(
                activityId: $activity->id,
                targetUserId: (int) $request->validated('user_id'),
                actor: $request->user(),
                notes: $request->validated('notes'),
            );
            /** @var User|null $targetUser */
            $targetUser = User::query()->find((int) $request->validated('user_id'));
            $album = Album::query()->find($activity->album_id);

            if ($targetUser && $album) {
                try {
                    $this->createShareCardService->createForUser(
                        user: $targetUser,
                        type: 'checkin_confirmed',
                        album: $album,
                        title: 'Presença confirmada',
                        subtitle: $activity->title,
                        metric: count($result['pack_ids']),
                        related: [
                            'activity_id' => $activity->id,
                            'checkin_id' => $result['checkin']->id,
                            'pack_ids' => $result['pack_ids'],
                        ],
                    );

                    $this->evaluateUserAchievementsService->evaluate($targetUser, $album);
                } catch (\Throwable) {
                    // Non-critical side effect: do not interrupt check-in flow.
                }
            }

            return back()->with('success', sprintf(
                'Check-in confirmado. %d pacote(s) criado(s).',
                count($result['pack_ids']),
            ));
        } catch (ActivityCheckinException $exception) {
            return back()->withErrors([
                'checkin' => $exception->getMessage(),
            ]);
        }
    }

    public function revoke(RevokeActivityCheckinRequest $request, ActivityCheckin $activityCheckin): RedirectResponse
    {
        $this->authorize('revoke', $activityCheckin);

        try {
            $this->revokeActivityCheckinService->revoke(
                activityCheckin: $activityCheckin,
                actor: $request->user(),
                reason: (string) $request->validated('revoke_reason'),
            );

            return back()->with('success', 'Check-in revogado com sucesso.');
        } catch (ActivityCheckinException $exception) {
            return back()->withErrors([
                'checkin' => $exception->getMessage(),
            ]);
        }
    }
}
