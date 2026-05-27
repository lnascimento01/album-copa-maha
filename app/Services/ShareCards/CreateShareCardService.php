<?php

namespace App\Services\ShareCards;

use App\Models\Album;
use App\Models\ShareCard;
use App\Models\User;
use App\Services\Audit\AuditLogger;

class CreateShareCardService
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    /**
     * @param  array<string, mixed>  $related
     */
    public function createForUser(
        User $user,
        string $type,
        ?Album $album,
        string $title,
        ?string $subtitle = null,
        int|string|null $metric = null,
        array $related = [],
        string $visualVariant = 'season-card'
    ): ShareCard {
        $payload = [
            'type' => $type,
            'user_name' => $user->name,
            'album_name' => $album?->name,
            'title' => $title,
            'subtitle' => $subtitle,
            'metric' => $metric,
            'date' => now()->toDateTimeString(),
            'visual_variant' => $visualVariant,
            'related' => $related,
            'share_copy' => $this->buildShareCopy($type, $subtitle, $metric),
        ];

        $card = ShareCard::query()->create([
            'user_id' => $user->id,
            'album_id' => $album?->id,
            'type' => $type,
            'title' => $title,
            'subtitle' => $subtitle,
            'payload' => $payload,
            'created_at' => now(),
        ]);

        $this->auditLogger->log(
            action: 'share_card.created',
            actor: $user,
            target: $user,
            entityType: ShareCard::class,
            entityId: $card->id,
            metadata: [
                'share_card_id' => $card->id,
                'type' => $type,
                'album_id' => $album?->id,
                ...$related,
            ],
        );

        return $card;
    }

    private function buildShareCopy(string $type, ?string $subtitle, int|string|null $metric): string
    {
        return match ($type) {
            ShareCard::TYPE_ALBUM_PROGRESS => sprintf('Completei %s%% do Álbum da Copa MAHA. Cada presença conta.', (string) $metric),
            ShareCard::TYPE_ACHIEVEMENT_UNLOCKED => sprintf('Desbloqueei uma nova conquista no Álbum da Copa MAHA: %s.', (string) ($subtitle ?? 'Nova conquista')),
            ShareCard::TYPE_PACK_OPENED => 'Abri mais um pacote e avancei na coleção do time.',
            ShareCard::TYPE_STICKER_UNLOCKED => 'Desbloqueei uma nova figurinha no Álbum da Copa MAHA. Presença, coleção e time.',
            ShareCard::TYPE_SOCIAL_MISSION_APPROVED => 'Missão social aprovada. Mais um pacote desbloqueado.',
            default => 'Minha temporada no Álbum da Copa MAHA segue evoluindo.',
        };
    }
}
