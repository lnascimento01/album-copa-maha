<?php

namespace App\Services\Stickers;

use App\Models\Album;
use App\Models\StickerPack;
use App\Models\StickerPackItem;
use App\Models\User;
use App\Models\UserSticker;
use App\Services\Audit\AuditLogger;
use App\Services\Stickers\Exceptions\StickerPackOpenException;
use Illuminate\Support\Facades\DB;
use Throwable;

class OpenStickerPackService
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    /**
     * @return array{pack: StickerPack, delivered_sticker_ids: int[]}
     */
    public function openForUser(int $packId, User $actor): array
    {
        DB::beginTransaction();

        try {
            $pack = StickerPack::query()
                ->with(['album', 'user'])
                ->lockForUpdate()
                ->find($packId);

            if (! $pack instanceof StickerPack) {
                throw new StickerPackOpenException('Pacote não encontrado.', 'not_found');
            }

            if ($pack->user_id !== $actor->id) {
                throw new StickerPackOpenException('Você não pode abrir este pacote.', 'wrong_owner', [
                    'pack_id' => $pack->id,
                    'album_id' => $pack->album_id,
                    'user_id' => $pack->user_id,
                    'detail' => 'Usuário tentou abrir pacote de outro participante.',
                ]);
            }

            if ($pack->status !== StickerPack::STATUS_PENDING) {
                throw new StickerPackOpenException('Este pacote não está disponível para abertura.', 'invalid_status', [
                    'pack_id' => $pack->id,
                    'album_id' => $pack->album_id,
                    'user_id' => $pack->user_id,
                    'detail' => 'Pacote não está pendente para abertura.',
                ]);
            }

            if (! $pack->user->isApproved()) {
                throw new StickerPackOpenException('Seu acesso não está aprovado para abrir pacotes.', 'user_not_approved', [
                    'pack_id' => $pack->id,
                    'album_id' => $pack->album_id,
                    'user_id' => $pack->user_id,
                    'detail' => 'Usuário não aprovado tentou abrir pacote.',
                ]);
            }

            if ($pack->album->status !== Album::STATUS_ACTIVE) {
                throw new StickerPackOpenException('Este pacote pertence a um álbum não ativo.', 'album_not_active', [
                    'pack_id' => $pack->id,
                    'album_id' => $pack->album_id,
                    'user_id' => $pack->user_id,
                    'detail' => 'Álbum do pacote não está ativo.',
                ]);
            }

            if ($pack->size < 1 || $pack->size > 10) {
                throw new StickerPackOpenException('Pacote com tamanho inválido.', 'invalid_size', [
                    'pack_id' => $pack->id,
                    'album_id' => $pack->album_id,
                    'user_id' => $pack->user_id,
                    'detail' => 'Pacote com tamanho inválido.',
                ]);
            }

            $activeStickers = $pack->album->collectibleStickersQuery()
                ->select(['id', 'rarity'])
                ->get();

            // withTrashed: soft-deleted stickers still occupy the unique(user_id, sticker_id)
            // DB row; re-inserting would throw a constraint violation → 500.
            $unlockedIds = UserSticker::withTrashed()
                ->where('user_id', $pack->user_id)
                ->whereIn('sticker_id', $activeStickers->pluck('id')->all())
                ->pluck('sticker_id')
                ->all();

            $missingStickers = $activeStickers->whereNotIn('id', $unlockedIds);

            if ($missingStickers->isEmpty()) {
                throw new StickerPackOpenException(
                    'Você já completou este álbum. Este pacote não pode ser aberto agora.',
                    'no_missing_stickers',
                    [
                        'pack_id' => $pack->id,
                        'album_id' => $pack->album_id,
                        'user_id' => $pack->user_id,
                    ],
                );
            }

            $deliveredStickerIds = $this->drawByRarity($missingStickers, $pack->size);

            $now = now();

            StickerPackItem::query()->insert(
                collect($deliveredStickerIds)
                    ->map(fn (int $stickerId): array => [
                        'sticker_pack_id' => $pack->id,
                        'sticker_id' => $stickerId,
                        'created_at' => $now,
                    ])
                    ->all(),
            );

            UserSticker::query()->insert(
                collect($deliveredStickerIds)
                    ->map(fn (int $stickerId): array => [
                        'user_id' => $pack->user_id,
                        'sticker_id' => $stickerId,
                        'source' => 'pack',
                        'source_id' => $pack->id,
                        'unlocked_at' => $now,
                        'created_at' => $now,
                    ])
                    ->all(),
            );

            $pack->forceFill([
                'status' => StickerPack::STATUS_OPENED,
                'opened_at' => $now,
            ])->save();

            $this->auditLogger->log(
                action: 'sticker_pack.opened',
                actor: $actor,
                target: $pack->user,
                entityType: StickerPack::class,
                entityId: $pack->id,
                metadata: [
                    'pack_id' => $pack->id,
                    'album_id' => $pack->album_id,
                    'user_id' => $pack->user_id,
                    'sticker_ids' => $deliveredStickerIds,
                    'requested_size' => $pack->size,
                    'delivered_count' => count($deliveredStickerIds),
                ],
            );

            $pack->load(['items.sticker']);

            DB::commit();

            return [
                'pack' => $pack,
                'delivered_sticker_ids' => $deliveredStickerIds,
            ];
        } catch (StickerPackOpenException $exception) {
            DB::rollBack();
            $this->auditFailedOpen($exception, $actor);

            throw $exception;
        } catch (Throwable $exception) {
            DB::rollBack();

            throw $exception;
        }
    }

    /**
     * Draw sticker IDs weighted by rarity.
     *
     * For each slot the rarity is chosen proportionally to its weight.
     * When a rarity pool runs out (user already owns all stickers of that
     * rarity) it is excluded and the remaining weights are renormalised
     * automatically on the next draw.
     *
     * Weights: common=70, rare=20, epic=8, legendary=2.
     *
     * @param  \Illuminate\Database\Eloquent\Collection<int, \App\Models\Sticker>  $missing
     * @return int[]
     */
    private function drawByRarity(\Illuminate\Database\Eloquent\Collection $missing, int $slots): array
    {
        $weights = [
            'common'    => 70,
            'rare'      => 20,
            'epic'      => 8,
            'legendary' => 2,
        ];

        $pools = [];

        foreach ($missing as $sticker) {
            $pools[$sticker->rarity][] = $sticker->id;
        }

        foreach (array_keys($pools) as $rarity) {
            shuffle($pools[$rarity]);
        }

        $drawn = [];

        while ($slots > 0) {
            $available = array_filter($pools, fn (array $ids): bool => $ids !== []);

            if ($available === []) {
                break;
            }

            $totalWeight = 0;

            foreach (array_keys($available) as $rarity) {
                $totalWeight += $weights[$rarity] ?? 1;
            }

            $rand = random_int(1, $totalWeight);
            $cumulative = 0;
            $chosen = null;

            foreach ($weights as $rarity => $weight) {
                if (! isset($available[$rarity])) {
                    continue;
                }

                $cumulative += $weight;

                if ($rand <= $cumulative) {
                    $chosen = $rarity;
                    break;
                }
            }

            // Fallback for rarities not present in the weights table
            if ($chosen === null) {
                $chosen = (string) array_key_first($available);
            }

            $drawn[] = array_shift($pools[$chosen]);
            $slots--;
        }

        return $drawn;
    }

    private function auditFailedOpen(StickerPackOpenException $exception, User $actor): void
    {
        if ($exception->reason === 'not_found') {
            return;
        }

        $packId = isset($exception->context['pack_id']) ? (int) $exception->context['pack_id'] : null;
        $target = isset($exception->context['user_id'])
            ? User::query()->find((int) $exception->context['user_id'])
            : null;

        $action = $exception->reason === 'no_missing_stickers'
            ? 'sticker_pack.no_missing_stickers'
            : 'sticker_pack.open_denied';

        $this->auditLogger->log(
            action: $action,
            actor: $actor,
            target: $target,
            entityType: StickerPack::class,
            entityId: $packId,
            metadata: [
                'pack_id' => $packId,
                'album_id' => $exception->context['album_id'] ?? null,
                'user_id' => $exception->context['user_id'] ?? null,
                'reason' => $exception->reason,
                'detail' => $exception->context['detail'] ?? $exception->getMessage(),
            ],
        );
    }
}
