<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RevokeActivityCheckinSessionRequest;
use App\Http\Requests\StoreActivityCheckinSessionRequest;
use App\Models\Activity;
use App\Models\ActivityCheckinSession;
use App\Services\Activities\CreateActivityCheckinSessionService;
use App\Services\Activities\Exceptions\ActivityCheckinException;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\RedirectResponse;

class ActivityCheckinSessionController extends Controller
{
    public function __construct(
        private readonly CreateActivityCheckinSessionService $createActivityCheckinSessionService,
        private readonly AuditLogger $auditLogger,
    ) {}

    public function store(StoreActivityCheckinSessionRequest $request, Activity $activity): RedirectResponse
    {
        $this->authorize('create', ActivityCheckinSession::class);

        try {
            $result = $this->createActivityCheckinSessionService->create(
                activity: $activity->load('album'),
                actor: $request->user(),
                durationMinutes: (int) $request->validated('duration_minutes'),
                maxUses: $request->validated('max_uses') ? (int) $request->validated('max_uses') : null,
                startsAt: $request->validated('starts_at'),
                note: $request->validated('note'),
            );

            return redirect()->route('admin.activities.show', $activity)->with([
                'success' => 'Sessão de check-in criada com sucesso.',
                'selfCheckin' => [
                    'session_id' => $result['session']->id,
                    'public_url' => $result['public_url'],
                    'public_code' => $result['session']->public_code,
                    'expires_at' => $result['session']->expires_at?->toDateTimeString(),
                ],
            ]);
        } catch (ActivityCheckinException $exception) {
            return back()->withErrors([
                'session' => $exception->getMessage(),
            ]);
        }
    }

    public function revoke(RevokeActivityCheckinSessionRequest $request, ActivityCheckinSession $session): RedirectResponse
    {
        $this->authorize('revoke', $session);

        if ($session->status !== ActivityCheckinSession::STATUS_ACTIVE) {
            return back()->withErrors([
                'session' => 'Somente sessões ativas podem ser revogadas.',
            ]);
        }

        $reason = (string) $request->validated('revoke_reason');

        $session->forceFill([
            'status' => ActivityCheckinSession::STATUS_REVOKED,
            'revoked_at' => now(),
            'revoked_by' => $request->user()?->id,
            'revoke_reason' => $reason,
        ])->save();

        $this->auditLogger->log(
            action: 'activity_checkin_session.revoked',
            actor: $request->user(),
            entityType: ActivityCheckinSession::class,
            entityId: $session->id,
            metadata: [
                'session_id' => $session->id,
                'activity_id' => $session->activity_id,
                'reason' => $reason,
            ],
        );

        return back()->with('success', 'Sessão de check-in revogada com sucesso.');
    }
}
