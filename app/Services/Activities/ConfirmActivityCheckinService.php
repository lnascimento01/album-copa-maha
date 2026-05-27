<?php

namespace App\Services\Activities;

use App\Models\Activity;
use App\Models\ActivityCheckin;
use App\Models\Album;
use App\Models\StickerPack;
use App\Models\User;
use App\Services\Activities\Exceptions\ActivityCheckinException;
use App\Services\Audit\AuditLogger;
use Illuminate\Support\Facades\DB;
use Throwable;

class ConfirmActivityCheckinService
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    /**
     * @return array{checkin: ActivityCheckin, pack_ids: int[]}
     */
    public function confirm(int $activityId, int $targetUserId, User $actor, ?string $notes = null): array
    {
        DB::beginTransaction();

        try {
            $result = $this->confirmWithinTransaction($activityId, $targetUserId, $actor, $notes);

            DB::commit();

            return $result;
        } catch (ActivityCheckinException $exception) {
            DB::rollBack();

            throw $exception;
        } catch (Throwable $exception) {
            DB::rollBack();

            throw $exception;
        }
    }

    /**
     * @return array{checkin: ActivityCheckin, pack_ids: int[]}
     */
    public function confirmWithinTransaction(int $activityId, int $targetUserId, User $actor, ?string $notes = null): array
    {
        $activity = Activity::query()
            ->with(['album'])
            ->lockForUpdate()
            ->find($activityId);

        if (! $activity instanceof Activity) {
            throw new ActivityCheckinException('Atividade não encontrada.', 'activity_not_found');
        }

        $targetUser = User::query()->lockForUpdate()->find($targetUserId);

        if (! $targetUser instanceof User) {
            throw new ActivityCheckinException('Participante não encontrado.', 'user_not_found');
        }

        if ($activity->status !== Activity::STATUS_OPEN) {
            throw new ActivityCheckinException('Somente atividades abertas aceitam check-in.', 'activity_not_open', [
                'activity_id' => $activity->id,
                'target_user_id' => $targetUserId,
            ]);
        }

        if ($activity->album->status !== Album::STATUS_ACTIVE) {
            throw new ActivityCheckinException('A atividade está vinculada a um álbum não ativo.', 'album_not_active', [
                'activity_id' => $activity->id,
                'target_user_id' => $targetUserId,
            ]);
        }

        if (! $targetUser->isApproved()) {
            throw new ActivityCheckinException('Somente participantes aprovados podem receber check-in.', 'user_not_approved', [
                'activity_id' => $activity->id,
                'target_user_id' => $targetUserId,
            ]);
        }

        $existingCheckin = ActivityCheckin::query()
            ->where('activity_id', $activity->id)
            ->where('user_id', $targetUser->id)
            ->exists();

        if ($existingCheckin) {
            throw new ActivityCheckinException('Este participante já possui check-in nesta atividade.', 'duplicate_checkin', [
                'activity_id' => $activity->id,
                'target_user_id' => $targetUserId,
            ]);
        }

        if ($activity->reward_pack_quantity < 0 || $activity->reward_pack_quantity > 10) {
            throw new ActivityCheckinException('A atividade possui quantidade de pacotes inválida.', 'invalid_reward_quantity', [
                'activity_id' => $activity->id,
                'target_user_id' => $targetUserId,
            ]);
        }

        if ($activity->reward_pack_size < 1 || $activity->reward_pack_size > 10) {
            throw new ActivityCheckinException('A atividade possui tamanho de pacote inválido.', 'invalid_reward_size', [
                'activity_id' => $activity->id,
                'target_user_id' => $targetUserId,
            ]);
        }

        $checkin = ActivityCheckin::query()->create([
            'activity_id' => $activity->id,
            'user_id' => $targetUser->id,
            'checked_by' => $actor->id,
            'status' => ActivityCheckin::STATUS_CONFIRMED,
            'checked_at' => now(),
            'notes' => $notes,
            'metadata' => [
                'activity_title' => $activity->title,
                'activity_type' => $activity->type,
            ],
        ]);

        $packIds = [];

        for ($i = 0; $i < $activity->reward_pack_quantity; $i++) {
            $pack = StickerPack::query()->create([
                'user_id' => $targetUser->id,
                'album_id' => $activity->album_id,
                'activity_id' => $activity->id,
                'activity_checkin_id' => $checkin->id,
                'granted_by' => $actor->id,
                'source' => StickerPack::SOURCE_CHECKIN,
                'status' => StickerPack::STATUS_PENDING,
                'size' => $activity->reward_pack_size,
                'metadata' => [
                    'activity_title' => $activity->title,
                    'activity_type' => $activity->type,
                    'checkin_id' => $checkin->id,
                    'reward_pack_quantity' => $activity->reward_pack_quantity,
                    'reward_pack_size' => $activity->reward_pack_size,
                ],
            ]);

            $packIds[] = $pack->id;
        }

        $this->auditLogger->log(
            action: 'activity_checkin.confirmed',
            actor: $actor,
            target: $targetUser,
            entityType: ActivityCheckin::class,
            entityId: $checkin->id,
            metadata: [
                'activity_id' => $activity->id,
                'checkin_id' => $checkin->id,
                'pack_ids' => $packIds,
                'quantity' => $activity->reward_pack_quantity,
                'size' => $activity->reward_pack_size,
            ],
        );

        $this->auditLogger->log(
            action: 'sticker_pack.granted_by_checkin',
            actor: $actor,
            target: $targetUser,
            entityType: ActivityCheckin::class,
            entityId: $checkin->id,
            metadata: [
                'activity_id' => $activity->id,
                'checkin_id' => $checkin->id,
                'pack_ids' => $packIds,
                'source' => StickerPack::SOURCE_CHECKIN,
            ],
        );

        return [
            'checkin' => $checkin,
            'pack_ids' => $packIds,
        ];
    }
}
