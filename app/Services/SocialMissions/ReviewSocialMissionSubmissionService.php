<?php

namespace App\Services\SocialMissions;

use App\Models\Album;
use App\Models\SocialMission;
use App\Models\SocialMissionSubmission;
use App\Models\StickerPack;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use App\Services\SocialMissions\Exceptions\SocialMissionException;
use Illuminate\Support\Facades\DB;
use Throwable;

class ReviewSocialMissionSubmissionService
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    /**
     * @return array{submission: SocialMissionSubmission, pack_ids: int[]}
     */
    public function approve(int $submissionId, User $actor, ?string $note = null): array
    {
        DB::beginTransaction();

        try {
            $submission = SocialMissionSubmission::query()
                ->with(['mission.album', 'user'])
                ->lockForUpdate()
                ->find($submissionId);

            if (! $submission instanceof SocialMissionSubmission) {
                throw new SocialMissionException('Submissão não encontrada.', 'submission_not_found');
            }

            $mission = $submission->mission;

            if ($submission->status !== SocialMissionSubmission::STATUS_PENDING) {
                throw new SocialMissionException('Somente submissões pendentes podem ser aprovadas.', 'submission_not_pending', [
                    'submission_id' => $submission->id,
                    'social_mission_id' => $mission->id,
                    'user_id' => $submission->user_id,
                ]);
            }

            if ($mission->status === SocialMission::STATUS_CANCELLED) {
                throw new SocialMissionException('Não é possível aprovar submissões de missão cancelada.', 'mission_cancelled', [
                    'submission_id' => $submission->id,
                    'social_mission_id' => $mission->id,
                    'user_id' => $submission->user_id,
                ]);
            }

            if (! in_array($mission->status, [SocialMission::STATUS_ACTIVE, SocialMission::STATUS_CLOSED], true)) {
                throw new SocialMissionException('Esta missão não permite aprovação neste momento.', 'mission_invalid_status', [
                    'submission_id' => $submission->id,
                    'social_mission_id' => $mission->id,
                    'user_id' => $submission->user_id,
                    'status' => $mission->status,
                ]);
            }

            if ($mission->album->status !== Album::STATUS_ACTIVE) {
                throw new SocialMissionException('A missão está vinculada a álbum não ativo.', 'album_not_active', [
                    'submission_id' => $submission->id,
                    'social_mission_id' => $mission->id,
                    'user_id' => $submission->user_id,
                ]);
            }

            $submission->forceFill([
                'status' => SocialMissionSubmission::STATUS_APPROVED,
                'reviewed_by' => $actor->id,
                'reviewed_at' => now(),
                'rejection_reason' => null,
                'metadata' => array_filter([
                    ...((array) $submission->metadata),
                    'approval_note' => $note,
                ]),
            ])->save();

            $packIds = [];

            for ($i = 0; $i < $mission->reward_pack_quantity; $i++) {
                $pack = StickerPack::query()->create([
                    'user_id' => $submission->user_id,
                    'album_id' => $mission->album_id,
                    'granted_by' => $actor->id,
                    'source' => StickerPack::SOURCE_SOCIAL_MISSION,
                    'status' => StickerPack::STATUS_PENDING,
                    'size' => $mission->reward_pack_size,
                    'social_mission_id' => $mission->id,
                    'social_mission_submission_id' => $submission->id,
                    'metadata' => [
                        'mission_title' => $mission->title,
                        'mission_type' => $mission->type,
                        'submission_id' => $submission->id,
                    ],
                ]);

                $packIds[] = $pack->id;
            }

            $mission->increment('approved_count');

            $this->auditLogger->log(
                action: 'social_mission_submission.approved',
                actor: $actor,
                target: $submission->user,
                entityType: SocialMissionSubmission::class,
                entityId: $submission->id,
                metadata: [
                    'social_mission_id' => $mission->id,
                    'submission_id' => $submission->id,
                    'pack_ids' => $packIds,
                ],
            );

            $this->auditLogger->log(
                action: 'sticker_pack.granted_by_social_mission',
                actor: $actor,
                target: $submission->user,
                entityType: SocialMissionSubmission::class,
                entityId: $submission->id,
                metadata: [
                    'social_mission_id' => $mission->id,
                    'submission_id' => $submission->id,
                    'pack_ids' => $packIds,
                ],
            );

            DB::commit();

            return [
                'submission' => $submission,
                'pack_ids' => $packIds,
            ];
        } catch (SocialMissionException $exception) {
            DB::rollBack();
            $this->auditDenied($exception, $actor);

            throw $exception;
        } catch (Throwable $exception) {
            DB::rollBack();

            throw $exception;
        }
    }

    public function reject(int $submissionId, User $actor, string $reason): SocialMissionSubmission
    {
        $submission = SocialMissionSubmission::query()
            ->with(['mission', 'user'])
            ->find($submissionId);

        if (! $submission instanceof SocialMissionSubmission) {
            throw new SocialMissionException('Submissão não encontrada.', 'submission_not_found');
        }

        if ($submission->status !== SocialMissionSubmission::STATUS_PENDING) {
            throw new SocialMissionException('Somente submissões pendentes podem ser rejeitadas.', 'submission_not_pending', [
                'submission_id' => $submission->id,
                'social_mission_id' => $submission->social_mission_id,
                'user_id' => $submission->user_id,
            ]);
        }

        $submission->forceFill([
            'status' => SocialMissionSubmission::STATUS_REJECTED,
            'reviewed_by' => $actor->id,
            'reviewed_at' => now(),
            'rejection_reason' => $reason,
        ])->save();

        $this->auditLogger->log(
            action: 'social_mission_submission.rejected',
            actor: $actor,
            target: $submission->user,
            entityType: SocialMissionSubmission::class,
            entityId: $submission->id,
            metadata: [
                'social_mission_id' => $submission->social_mission_id,
                'submission_id' => $submission->id,
                'reason' => $reason,
            ],
        );

        return $submission;
    }

    private function auditDenied(SocialMissionException $exception, User $actor): void
    {
        if ($exception->reason === 'submission_not_found') {
            return;
        }

        $this->auditLogger->log(
            action: 'social_mission_submission.denied',
            actor: $actor,
            target: isset($exception->context['user_id']) ? User::query()->find((int) $exception->context['user_id']) : null,
            entityType: SocialMissionSubmission::class,
            entityId: isset($exception->context['submission_id']) ? (int) $exception->context['submission_id'] : null,
            metadata: [
                'reason' => $exception->reason,
                'social_mission_id' => $exception->context['social_mission_id'] ?? null,
                'submission_id' => $exception->context['submission_id'] ?? null,
            ],
        );
    }
}
