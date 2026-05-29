<?php

namespace App\Services\Activities;

use App\Models\Activity;
use App\Models\ActivityCheckinSession;
use App\Models\Album;
use App\Models\User;
use App\Services\Activities\Exceptions\ActivityCheckinException;
use App\Services\Audit\AuditLogger;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class CreateActivityCheckinSessionService
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    /**
     * @return array{session: ActivityCheckinSession, raw_token: string, public_url: string}
     */
    public function create(
        Activity $activity,
        User $actor,
        int $durationMinutes = 15,
        ?int $maxUses = null,
        $startsAt = null,
        ?string $note = null,
    ): array {
        if ($activity->status !== Activity::STATUS_OPEN) {
            throw new ActivityCheckinException('Somente atividades abertas podem ter sessão de check-in.', 'activity_not_open', [
                'activity_id' => $activity->id,
            ]);
        }

        if ($activity->album->status !== Album::STATUS_ACTIVE) {
            throw new ActivityCheckinException('A atividade está vinculada a um álbum não ativo.', 'album_not_active', [
                'activity_id' => $activity->id,
            ]);
        }

        if ($durationMinutes < 1 || $durationMinutes > 240) {
            throw new ActivityCheckinException('A duração da sessão deve estar entre 1 e 240 minutos.', 'invalid_duration', [
                'activity_id' => $activity->id,
            ]);
        }

        if ($maxUses !== null && $maxUses < 1) {
            throw new ActivityCheckinException('O limite de usos deve ser maior que zero.', 'invalid_max_uses', [
                'activity_id' => $activity->id,
            ]);
        }

        $sessionStartsAt = $startsAt ? Carbon::parse($startsAt) : now();
        $expiresAt = $sessionStartsAt->copy()->addMinutes($durationMinutes);

        $rawToken = Str::random(64);
        $tokenHash = hash_hmac('sha256', $rawToken, (string) config('app.key'));
        $publicCode = $this->generateUniquePublicCode();

        $session = ActivityCheckinSession::query()->create([
            'activity_id' => $activity->id,
            'token_hash' => $tokenHash,
            'public_code' => $publicCode,
            'status' => ActivityCheckinSession::STATUS_ACTIVE,
            'starts_at' => $sessionStartsAt,
            'expires_at' => $expiresAt,
            'max_uses' => $maxUses,
            'used_count' => 0,
            'created_by' => $actor->id,
            'metadata' => [
                'duration_minutes' => $durationMinutes,
                'note' => $note,
            ],
        ]);

        $this->auditLogger->log(
            action: 'activity_checkin_session.created',
            actor: $actor,
            entityType: ActivityCheckinSession::class,
            entityId: $session->id,
            metadata: [
                'activity_id' => $activity->id,
                'session_id' => $session->id,
                'expires_at' => $session->expires_at?->toDateTimeString(),
                'public_code' => $session->public_code,
                'max_uses' => $session->max_uses,
            ],
        );

        return [
            'session' => $session,
            'raw_token' => $rawToken,
            'public_url' => url('/checkin/'.$rawToken),
        ];
    }

    private function generateUniquePublicCode(): string
    {
        do {
            $code = 'AAPH-'.strtoupper(Str::random(5));
        } while (ActivityCheckinSession::query()->where('public_code', $code)->exists());

        return $code;
    }
}
