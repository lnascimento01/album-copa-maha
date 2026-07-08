<?php

namespace App\Services\Rewards;

use App\Models\Album;
use App\Models\RewardCode;
use App\Models\RewardCodeRedemption;
use App\Models\StickerPack;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use App\Services\Rewards\Exceptions\RewardCodeRedeemException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class RedeemRewardCodeService
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    /**
     * @return array{redemption: RewardCodeRedemption, pack_ids: int[]}
     */
    public function redeem(string $rawCode, User $actor, ?int $albumId = null): array
    {
        $code = Str::upper(trim($rawCode));

        DB::beginTransaction();

        try {
            $rewardCode = RewardCode::query()
                ->with(['album'])
                ->lockForUpdate()
                ->where('code', $code)
                ->first();

            if (! $rewardCode instanceof RewardCode) {
                throw new RewardCodeRedeemException('Código inválido ou indisponível.', 'invalid_code', [
                    'code' => $code,
                ]);
            }

            $this->assertCanRedeem($rewardCode, $actor, $albumId);

            $userRedemptionsCount = RewardCodeRedemption::query()
                ->where('reward_code_id', $rewardCode->id)
                ->where('user_id', $actor->id)
                ->count();

            if ($userRedemptionsCount >= $rewardCode->max_redemptions_per_user) {
                throw new RewardCodeRedeemException('Você já atingiu o limite de resgates deste código.', 'max_per_user_reached', [
                    'reward_code_id' => $rewardCode->id,
                    'user_id' => $actor->id,
                    'code' => $rewardCode->code,
                ]);
            }

            if ($rewardCode->max_total_redemptions !== null && $rewardCode->redeemed_count >= $rewardCode->max_total_redemptions) {
                throw new RewardCodeRedeemException('Código inválido ou indisponível.', 'max_total_reached', [
                    'reward_code_id' => $rewardCode->id,
                    'user_id' => $actor->id,
                    'code' => $rewardCode->code,
                ]);
            }

            $redemption = RewardCodeRedemption::query()->create([
                'reward_code_id' => $rewardCode->id,
                'user_id' => $actor->id,
                'redeemed_at' => now(),
                'ip_address' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
                'metadata' => [
                    'code' => $rewardCode->code,
                    'title' => $rewardCode->title,
                    'source_channel' => $rewardCode->source_channel,
                ],
            ]);

            $packIds = [];

            for ($i = 0; $i < $rewardCode->reward_pack_quantity; $i++) {
                $pack = StickerPack::query()->create([
                    'user_id' => $actor->id,
                    'album_id' => $rewardCode->album_id,
                    'reward_code_id' => $rewardCode->id,
                    'reward_code_redemption_id' => $redemption->id,
                    'granted_by' => $rewardCode->created_by,
                    'source' => StickerPack::SOURCE_REWARD_CODE,
                    'status' => StickerPack::STATUS_PENDING,
                    'size' => $rewardCode->reward_pack_size,
                    'metadata' => [
                        'reward_code_title' => $rewardCode->title,
                        'reward_code_channel' => $rewardCode->source_channel,
                        'reward_code' => $rewardCode->code,
                        'redemption_id' => $redemption->id,
                    ],
                ]);

                $packIds[] = $pack->id;
            }

            $rewardCode->increment('redeemed_count');

            $this->auditLogger->log(
                action: 'reward_code.redeemed',
                actor: $actor,
                target: $actor,
                entityType: RewardCodeRedemption::class,
                entityId: $redemption->id,
                metadata: [
                    'reward_code_id' => $rewardCode->id,
                    'reward_code' => $rewardCode->code,
                    'redemption_id' => $redemption->id,
                    'pack_ids' => $packIds,
                    'quantity' => $rewardCode->reward_pack_quantity,
                    'size' => $rewardCode->reward_pack_size,
                ],
            );

            $this->auditLogger->log(
                action: 'sticker_pack.granted_by_reward_code',
                actor: $actor,
                target: $actor,
                entityType: RewardCodeRedemption::class,
                entityId: $redemption->id,
                metadata: [
                    'reward_code_id' => $rewardCode->id,
                    'reward_code' => $rewardCode->code,
                    'redemption_id' => $redemption->id,
                    'pack_ids' => $packIds,
                ],
            );

            DB::commit();

            return [
                'redemption' => $redemption,
                'pack_ids' => $packIds,
            ];
        } catch (RewardCodeRedeemException $exception) {
            DB::rollBack();
            $this->auditDenied($exception, $actor, $code);

            throw $exception;
        } catch (Throwable $exception) {
            DB::rollBack();

            throw $exception;
        }
    }

    private function assertCanRedeem(RewardCode $rewardCode, User $actor, ?int $albumId): void
    {
        if (! $actor->isApproved()) {
            throw new RewardCodeRedeemException('Sua conta ainda não está liberada para participar.', 'user_not_approved', [
                'reward_code_id' => $rewardCode->id,
                'code' => $rewardCode->code,
                'user_id' => $actor->id,
            ]);
        }

        if ($rewardCode->status !== RewardCode::STATUS_ACTIVE) {
            throw new RewardCodeRedeemException('Código inválido ou indisponível.', 'invalid_status', [
                'reward_code_id' => $rewardCode->id,
                'code' => $rewardCode->code,
                'user_id' => $actor->id,
                'status' => $rewardCode->status,
            ]);
        }

        if (! $actor->hasPermission('rewardCodes.redeemOwn')) {
            throw new RewardCodeRedeemException('Não foi possível concluir o resgate.', 'missing_permission', [
                'reward_code_id' => $rewardCode->id,
                'code' => $rewardCode->code,
                'user_id' => $actor->id,
            ]);
        }

        if ($rewardCode->album->status !== Album::STATUS_ACTIVE) {
            throw new RewardCodeRedeemException('Código inválido ou indisponível.', 'album_not_active', [
                'reward_code_id' => $rewardCode->id,
                'code' => $rewardCode->code,
                'user_id' => $actor->id,
            ]);
        }

        if ($albumId !== null && $rewardCode->album_id !== $albumId) {
            throw new RewardCodeRedeemException('Código inválido ou indisponível.', 'wrong_album', [
                'reward_code_id' => $rewardCode->id,
                'code' => $rewardCode->code,
                'user_id' => $actor->id,
                'album_id' => $albumId,
            ]);
        }

        if ($rewardCode->starts_at !== null && now()->lt($rewardCode->starts_at)) {
            throw new RewardCodeRedeemException('Este código ainda não está disponível.', 'not_started', [
                'reward_code_id' => $rewardCode->id,
                'code' => $rewardCode->code,
                'user_id' => $actor->id,
                'starts_at' => $rewardCode->starts_at->toDateTimeString(),
            ]);
        }

        if ($rewardCode->expires_at !== null && now()->gt($rewardCode->expires_at)) {
            throw new RewardCodeRedeemException('Este código expirou.', 'expired', [
                'reward_code_id' => $rewardCode->id,
                'code' => $rewardCode->code,
                'user_id' => $actor->id,
                'expires_at' => $rewardCode->expires_at->toDateTimeString(),
            ]);
        }

        $allowedUserIds = $rewardCode->allowedUsers()->pluck('users.id');

        if ($allowedUserIds->isNotEmpty() && ! $allowedUserIds->contains($actor->id)) {
            throw new RewardCodeRedeemException(
                'Este código não está disponível para o seu usuário.',
                'user_not_allowed',
                [
                    'reward_code_id' => $rewardCode->id,
                    'code' => $rewardCode->code,
                    'user_id' => $actor->id,
                ],
            );
        }

        if ($rewardCode->reward_pack_quantity < 0 || $rewardCode->reward_pack_quantity > 10) {
            throw new RewardCodeRedeemException('Código inválido ou indisponível.', 'invalid_reward_quantity', [
                'reward_code_id' => $rewardCode->id,
                'code' => $rewardCode->code,
            ]);
        }

        if ($rewardCode->reward_pack_size < 1 || $rewardCode->reward_pack_size > 10) {
            throw new RewardCodeRedeemException('Código inválido ou indisponível.', 'invalid_reward_size', [
                'reward_code_id' => $rewardCode->id,
                'code' => $rewardCode->code,
            ]);
        }
    }

    private function auditDenied(RewardCodeRedeemException $exception, User $actor, string $code): void
    {
        $this->auditLogger->log(
            action: 'reward_code.redeem_denied',
            actor: $actor,
            target: $actor,
            entityType: RewardCode::class,
            entityId: isset($exception->context['reward_code_id']) ? (int) $exception->context['reward_code_id'] : null,
            metadata: [
                'reason' => $exception->reason,
                'code' => $exception->context['code'] ?? $code,
                'user_id' => $actor->id,
            ],
        );
    }
}
