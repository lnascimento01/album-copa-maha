<?php

namespace App\Services\Activities;

use App\Models\Activity;
use App\Models\ActivityCheckin;
use App\Models\ActivityCheckinSession;
use App\Models\Album;
use App\Models\User;
use App\Services\Activities\Exceptions\ActivityCheckinException;
use App\Services\Audit\AuditLogger;
use Illuminate\Support\Facades\DB;
use Throwable;

class ConfirmSelfActivityCheckinService
{
    public function __construct(
        private readonly AuditLogger $auditLogger,
        private readonly ConfirmActivityCheckinService $confirmActivityCheckinService,
    ) {}

    /**
     * @return array{checkin: ActivityCheckin, pack_ids: int[], session: ActivityCheckinSession}
     */
    public function confirmByToken(string $rawToken, User $user): array
    {
        $tokenHash = $this->hashToken($rawToken);

        $session = ActivityCheckinSession::query()
            ->with(['activity.album'])
            ->where('token_hash', $tokenHash)
            ->first();

        if (! $session) {
            $this->auditLogger->log(
                action: 'activity_checkin_session.invalid_attempt',
                actor: $user,
                metadata: [
                    'reason' => 'invalid_token',
                    'user_id' => $user->id,
                ],
            );

            throw new ActivityCheckinException('Este check-in não está mais disponível.', 'invalid_token');
        }

        return $this->confirmWithSession($session->id, $user);
    }

    /**
     * @return array{checkin: ActivityCheckin, pack_ids: int[], session: ActivityCheckinSession}
     */
    public function confirmByCode(string $publicCode, User $user): array
    {
        $session = ActivityCheckinSession::query()
            ->with(['activity.album'])
            ->where('public_code', strtoupper(trim($publicCode)))
            ->first();

        if (! $session) {
            $this->auditLogger->log(
                action: 'activity_checkin_session.invalid_attempt',
                actor: $user,
                metadata: [
                    'reason' => 'invalid_code',
                    'user_id' => $user->id,
                ],
            );

            throw new ActivityCheckinException('Este check-in não está mais disponível.', 'invalid_code');
        }

        return $this->confirmWithSession($session->id, $user);
    }

    public function resolveSessionByToken(string $rawToken): ?ActivityCheckinSession
    {
        return ActivityCheckinSession::query()
            ->with(['activity.team', 'activity.album'])
            ->where('token_hash', $this->hashToken($rawToken))
            ->first();
    }

    private function hashToken(string $rawToken): string
    {
        return hash_hmac('sha256', $rawToken, (string) config('app.key'));
    }

    /**
     * @return array{checkin: ActivityCheckin, pack_ids: int[], session: ActivityCheckinSession}
     */
    private function confirmWithSession(int $sessionId, User $user): array
    {
        DB::beginTransaction();

        try {
            $session = ActivityCheckinSession::query()
                ->with(['activity.album'])
                ->lockForUpdate()
                ->find($sessionId);

            if (! $session instanceof ActivityCheckinSession) {
                throw new ActivityCheckinException('Este check-in não está mais disponível.', 'session_not_found');
            }

            $this->validateSessionForSelfCheckin($session, $user);

            $result = $this->confirmActivityCheckinService->confirmWithinTransaction(
                activityId: $session->activity_id,
                targetUserId: $user->id,
                actor: $user,
                notes: 'Check-in confirmado por autoatendimento (QR/código).',
            );

            $session->increment('used_count');

            $result['checkin']->forceFill([
                'metadata' => array_merge($result['checkin']->metadata ?? [], [
                    'self_checkin' => true,
                    'session_id' => $session->id,
                ]),
            ])->save();

            $this->auditLogger->log(
                action: 'activity_checkin.self_confirmed',
                actor: $user,
                target: $user,
                entityType: ActivityCheckin::class,
                entityId: $result['checkin']->id,
                metadata: [
                    'activity_id' => $session->activity_id,
                    'session_id' => $session->id,
                    'user_id' => $user->id,
                    'generated_pack_ids' => $result['pack_ids'],
                ],
            );

            DB::commit();

            return [
                ...$result,
                'session' => $session->fresh(),
            ];
        } catch (ActivityCheckinException $exception) {
            DB::rollBack();

            $this->auditDenied($exception, $user, $sessionId);

            throw $exception;
        } catch (Throwable $exception) {
            DB::rollBack();

            throw $exception;
        }
    }

    private function validateSessionForSelfCheckin(ActivityCheckinSession $session, User $user): void
    {
        if (! $user->hasPermission('activityCheckins.selfCreate')) {
            throw new ActivityCheckinException('Não foi possível confirmar sua presença.', 'missing_permission', [
                'session_id' => $session->id,
                'activity_id' => $session->activity_id,
            ]);
        }

        if (! $user->isApproved()) {
            throw new ActivityCheckinException('Sua conta ainda não está liberada para participar.', 'user_not_approved', [
                'session_id' => $session->id,
                'activity_id' => $session->activity_id,
            ]);
        }

        if ($session->status === ActivityCheckinSession::STATUS_REVOKED) {
            throw new ActivityCheckinException('Este check-in não está mais disponível.', 'session_revoked', [
                'session_id' => $session->id,
                'activity_id' => $session->activity_id,
            ]);
        }

        if ($session->status === ActivityCheckinSession::STATUS_EXPIRED || $session->expires_at->isPast()) {
            if ($session->status !== ActivityCheckinSession::STATUS_EXPIRED) {
                $session->forceFill(['status' => ActivityCheckinSession::STATUS_EXPIRED])->save();
            }

            throw new ActivityCheckinException('Este check-in não está mais disponível.', 'session_expired', [
                'session_id' => $session->id,
                'activity_id' => $session->activity_id,
            ]);
        }

        if ($session->starts_at && $session->starts_at->isFuture()) {
            throw new ActivityCheckinException('Este check-in ainda não está disponível.', 'session_not_started', [
                'session_id' => $session->id,
                'activity_id' => $session->activity_id,
            ]);
        }

        if ($session->max_uses !== null && $session->used_count >= $session->max_uses) {
            throw new ActivityCheckinException('Este check-in não está mais disponível.', 'max_uses_reached', [
                'session_id' => $session->id,
                'activity_id' => $session->activity_id,
            ]);
        }

        if ($session->activity->status !== Activity::STATUS_OPEN) {
            throw new ActivityCheckinException('Este check-in não está mais disponível.', 'activity_not_open', [
                'session_id' => $session->id,
                'activity_id' => $session->activity_id,
            ]);
        }

        if ($session->activity->album->status !== Album::STATUS_ACTIVE) {
            throw new ActivityCheckinException('Este check-in não está mais disponível.', 'album_not_active', [
                'session_id' => $session->id,
                'activity_id' => $session->activity_id,
            ]);
        }
    }

    private function auditDenied(ActivityCheckinException $exception, User $user, int $sessionId): void
    {
        $session = ActivityCheckinSession::query()->find($sessionId);

        $baseMetadata = [
            'session_id' => $sessionId,
            'activity_id' => $session?->activity_id,
            'user_id' => $user->id,
            'reason' => $exception->reason,
        ];

        if (in_array($exception->reason, ['session_expired', 'session_not_started', 'session_revoked', 'max_uses_reached'], true)) {
            $this->auditLogger->log(
                action: 'activity_checkin_session.expired_attempt',
                actor: $user,
                metadata: $baseMetadata,
            );
        } else {
            $this->auditLogger->log(
                action: 'activity_checkin.self_denied',
                actor: $user,
                metadata: $baseMetadata,
            );
        }
    }
}
