<?php

namespace App\Services\Activities;

use App\Models\ActivityCheckin;
use App\Models\StickerPack;
use App\Models\User;
use App\Services\Activities\Exceptions\ActivityCheckinException;
use App\Services\Audit\AuditLogger;
use Illuminate\Support\Facades\DB;
use Throwable;

class RevokeActivityCheckinService
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    public function revoke(ActivityCheckin $activityCheckin, User $actor, string $reason): void
    {
        DB::beginTransaction();

        try {
            $checkin = ActivityCheckin::query()
                ->with(['activity', 'user', 'stickerPacks'])
                ->lockForUpdate()
                ->find($activityCheckin->id);

            if (! $checkin instanceof ActivityCheckin) {
                throw new ActivityCheckinException('Check-in não encontrado.', 'checkin_not_found');
            }

            if ($checkin->status !== ActivityCheckin::STATUS_CONFIRMED) {
                throw new ActivityCheckinException('Somente check-ins confirmados podem ser revogados.', 'invalid_status', [
                    'checkin_id' => $checkin->id,
                    'activity_id' => $checkin->activity_id,
                    'target_user_id' => $checkin->user_id,
                ]);
            }

            $hasOpenedPack = $checkin->stickerPacks->contains(
                fn (StickerPack $pack): bool => $pack->status === StickerPack::STATUS_OPENED,
            );

            if ($hasOpenedPack) {
                throw new ActivityCheckinException(
                    'Não é possível revogar este check-in porque um ou mais pacotes já foram abertos.',
                    'opened_pack_exists',
                    [
                        'checkin_id' => $checkin->id,
                        'activity_id' => $checkin->activity_id,
                        'target_user_id' => $checkin->user_id,
                    ],
                );
            }

            $cancelledPackIds = [];

            foreach ($checkin->stickerPacks as $pack) {
                if ($pack->status === StickerPack::STATUS_PENDING) {
                    $pack->forceFill([
                        'status' => StickerPack::STATUS_CANCELLED,
                        'cancelled_at' => now(),
                        'cancellation_reason' => $reason,
                    ])->save();

                    $cancelledPackIds[] = $pack->id;
                }
            }

            $checkin->forceFill([
                'status' => ActivityCheckin::STATUS_REVOKED,
                'revoked_at' => now(),
                'revoked_by' => $actor->id,
                'revoke_reason' => $reason,
            ])->save();

            $this->auditLogger->log(
                action: 'activity_checkin.revoked',
                actor: $actor,
                target: $checkin->user,
                entityType: ActivityCheckin::class,
                entityId: $checkin->id,
                metadata: [
                    'checkin_id' => $checkin->id,
                    'activity_id' => $checkin->activity_id,
                    'cancelled_pack_ids' => $cancelledPackIds,
                    'reason' => $reason,
                ],
            );

            DB::commit();
        } catch (ActivityCheckinException $exception) {
            DB::rollBack();
            $this->auditDeniedIfApplicable($exception, $actor, $reason);

            throw $exception;
        } catch (Throwable $exception) {
            DB::rollBack();

            throw $exception;
        }
    }

    private function auditDeniedIfApplicable(ActivityCheckinException $exception, User $actor, string $reason): void
    {
        if ($exception->reason !== 'opened_pack_exists') {
            return;
        }

        $targetUser = isset($exception->context['target_user_id'])
            ? User::query()->find((int) $exception->context['target_user_id'])
            : null;

        $this->auditLogger->log(
            action: 'activity_checkin.revoke_denied',
            actor: $actor,
            target: $targetUser,
            entityType: ActivityCheckin::class,
            entityId: isset($exception->context['checkin_id']) ? (int) $exception->context['checkin_id'] : null,
            metadata: [
                'checkin_id' => $exception->context['checkin_id'] ?? null,
                'activity_id' => $exception->context['activity_id'] ?? null,
                'reason' => $reason,
                'detail' => $exception->getMessage(),
            ],
        );
    }
}
