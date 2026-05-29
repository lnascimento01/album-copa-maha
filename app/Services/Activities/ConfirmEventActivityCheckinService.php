<?php

namespace App\Services\Activities;

use App\Models\Activity;
use App\Models\ActivityCheckin;
use App\Models\User;
use App\Services\Activities\Exceptions\ActivityCheckinException;
use App\Services\Activities\Exceptions\EventCheckinException;
use App\Services\Audit\AuditLogger;
use Illuminate\Support\Facades\DB;
use Throwable;

class ConfirmEventActivityCheckinService
{
    public function __construct(
        private readonly AuditLogger $auditLogger,
        private readonly ConfirmActivityCheckinService $confirmActivityCheckinService,
    ) {}

    /**
     * @return array{checkin: ActivityCheckin, pack_ids: int[], event: Activity, distance_meters: int, accuracy_meters: int}
     */
    public function confirmByToken(string $token, User $user, float $latitude, float $longitude, float $accuracy): array
    {
        DB::beginTransaction();

        $event = null;
        $distanceMeters = null;

        try {
            $event = Activity::query()
                ->with(['album'])
                ->where('type', Activity::TYPE_EVENT)
                ->where('event_token', $token)
                ->lockForUpdate()
                ->first();

            if (! $event instanceof Activity) {
                throw $this->exception('EVENT_NOT_FOUND');
            }

            $this->assertUserCanCheckin($user);
            $this->assertEventStatus($event);
            $this->assertCheckinWindow($event);
            $this->assertNoDuplicateCheckin($event, $user);
            $this->assertLocationPayload($latitude, $longitude, $accuracy);

            if ($event->latitude === null || $event->longitude === null) {
                throw $this->exception('EVENT_NOT_ACTIVE');
            }

            if ($event->reward_pack_quantity < 1 || $event->reward_pack_quantity > 10 || $event->reward_pack_size < 1 || $event->reward_pack_size > 10) {
                throw $this->exception('REWARD_CONFIGURATION_INVALID', [
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                ]);
            }

            if ($accuracy > $event->max_accuracy_meters) {
                throw $this->exception('LOCATION_ACCURACY_TOO_LOW', [
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                    'accuracy_meters' => (int) round($accuracy),
                    'max_accuracy_meters' => $event->max_accuracy_meters,
                ]);
            }

            $distanceMeters = $this->haversineMeters(
                eventLatitude: (float) $event->latitude,
                eventLongitude: (float) $event->longitude,
                userLatitude: $latitude,
                userLongitude: $longitude,
            );

            if ($distanceMeters > $event->radius_meters) {
                throw $this->exception('OUTSIDE_ALLOWED_RADIUS', [
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                    'distance_meters' => $distanceMeters,
                    'radius_meters' => $event->radius_meters,
                    'accuracy_meters' => (int) round($accuracy),
                ]);
            }

            try {
                $result = $this->confirmActivityCheckinService->confirmWithinTransaction(
                    activityId: $event->id,
                    targetUserId: $user->id,
                    actor: $user,
                    notes: 'Check-in confirmado por geolocalização.',
                    options: [
                        'metadata' => [
                            'self_checkin' => true,
                            'event_checkin' => true,
                            'checkin_origin' => 'geolocation',
                        ],
                        'checkin_attributes' => [
                            'latitude' => $latitude,
                            'longitude' => $longitude,
                            'accuracy_meters' => (int) round($accuracy),
                            'distance_meters' => $distanceMeters,
                        ],
                    ],
                );
            } catch (ActivityCheckinException $exception) {
                throw $this->mapActivityException($exception);
            }

            $checkedAt = $result['checkin']->checked_at?->toDateTimeString();

            $this->auditLogger->log(
                action: 'event_checkin.created',
                actor: $user,
                target: $user,
                entityType: ActivityCheckin::class,
                entityId: $result['checkin']->id,
                metadata: [
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                    'distance_meters' => $distanceMeters,
                    'accuracy_meters' => (int) round($accuracy),
                    'radius_meters' => $event->radius_meters,
                    'checked_in_at' => $checkedAt,
                    'generated_pack_id' => $result['pack_ids'][0] ?? null,
                    'generated_pack_ids' => $result['pack_ids'],
                ],
            );

            $this->auditLogger->log(
                action: 'event_checkin.package_granted',
                actor: $user,
                target: $user,
                entityType: ActivityCheckin::class,
                entityId: $result['checkin']->id,
                metadata: [
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                    'generated_pack_id' => $result['pack_ids'][0] ?? null,
                    'generated_pack_ids' => $result['pack_ids'],
                    'checked_in_at' => $checkedAt,
                ],
            );

            DB::commit();

            return [
                ...$result,
                'event' => $event,
                'distance_meters' => $distanceMeters,
                'accuracy_meters' => (int) round($accuracy),
            ];
        } catch (EventCheckinException $exception) {
            DB::rollBack();
            $this->auditRejected($exception, $user, $event, $distanceMeters, (int) round($accuracy));

            throw $exception;
        } catch (Throwable $exception) {
            DB::rollBack();

            throw $exception;
        }
    }

    public function findEventByToken(string $token): ?Activity
    {
        return Activity::query()
            ->where('type', Activity::TYPE_EVENT)
            ->where('event_token', $token)
            ->first();
    }

    /**
     * @return array{status: string, message: string, already_checked_in: bool}
     */
    public function previewByToken(string $token, User $user): array
    {
        $event = $this->findEventByToken($token);

        if (! $event) {
            return [
                'status' => 'unavailable',
                'message' => $this->messageFor('EVENT_NOT_FOUND'),
                'already_checked_in' => false,
            ];
        }

        $alreadyCheckedIn = ActivityCheckin::query()
            ->where('activity_id', $event->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($alreadyCheckedIn) {
            return [
                'status' => 'already',
                'message' => $this->messageFor('ALREADY_CHECKED_IN'),
                'already_checked_in' => true,
            ];
        }

        try {
            $this->assertUserCanCheckin($user);
            $this->assertEventStatus($event);
            $this->assertCheckinWindow($event);
        } catch (EventCheckinException $exception) {
            return [
                'status' => match ($exception->reason) {
                    'CHECKIN_NOT_STARTED' => 'not_started',
                    'CHECKIN_EXPIRED' => 'expired',
                    default => 'unavailable',
                },
                'message' => $exception->getMessage(),
                'already_checked_in' => false,
            ];
        }

        return [
            'status' => 'available',
            'message' => 'Confirme sua presença no local do evento para receber sua recompensa.',
            'already_checked_in' => false,
        ];
    }

    private function assertUserCanCheckin(User $user): void
    {
        if (! $user->isApproved()) {
            throw $this->exception('USER_NOT_APPROVED', [
                'user_id' => $user->id,
            ]);
        }
    }

    private function assertEventStatus(Activity $event): void
    {
        if ($event->status !== Activity::STATUS_OPEN) {
            throw $this->exception('EVENT_NOT_ACTIVE', [
                'event_id' => $event->id,
                'event_status' => $event->status,
            ]);
        }
    }

    private function assertCheckinWindow(Activity $event): void
    {
        $timezone = $event->event_timezone ?: 'America/Sao_Paulo';
        $now = now()->setTimezone($timezone);
        $startsAt = $event->starts_at?->copy()->setTimezone($timezone);
        $endsAt = $event->ends_at?->copy()->setTimezone($timezone);

        if (! $startsAt || ! $endsAt) {
            throw $this->exception('EVENT_NOT_ACTIVE', [
                'event_id' => $event->id,
            ]);
        }

        if ($now->lt($startsAt)) {
            throw $this->exception('CHECKIN_NOT_STARTED', [
                'event_id' => $event->id,
                'checkin_starts_at' => $startsAt->toDateTimeString(),
            ]);
        }

        if ($now->gt($endsAt)) {
            throw $this->exception('CHECKIN_EXPIRED', [
                'event_id' => $event->id,
                'checkin_ends_at' => $endsAt->toDateTimeString(),
            ]);
        }
    }

    private function assertNoDuplicateCheckin(Activity $event, User $user): void
    {
        $alreadyCheckedIn = ActivityCheckin::query()
            ->where('activity_id', $event->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($alreadyCheckedIn) {
            throw $this->exception('ALREADY_CHECKED_IN', [
                'event_id' => $event->id,
                'user_id' => $user->id,
            ]);
        }
    }

    private function assertLocationPayload(float $latitude, float $longitude, float $accuracy): void
    {
        if (! is_finite($latitude) || ! is_finite($longitude) || ! is_finite($accuracy)) {
            throw $this->exception('LOCATION_REQUIRED');
        }
    }

    private function mapActivityException(ActivityCheckinException $exception): EventCheckinException
    {
        return match ($exception->reason) {
            'duplicate_checkin' => $this->exception('ALREADY_CHECKED_IN', $exception->context),
            'user_not_approved' => $this->exception('USER_NOT_APPROVED', $exception->context),
            'invalid_reward_quantity', 'invalid_reward_size' => $this->exception('REWARD_CONFIGURATION_INVALID', $exception->context),
            'activity_not_open', 'album_not_active' => $this->exception('EVENT_NOT_ACTIVE', $exception->context),
            default => $this->exception('EVENT_NOT_ACTIVE', $exception->context),
        };
    }

    private function exception(string $reason, array $context = []): EventCheckinException
    {
        return new EventCheckinException(
            message: $this->messageFor($reason),
            reason: $reason,
            context: $context,
        );
    }

    private function messageFor(string $reason): string
    {
        return match ($reason) {
            'EVENT_NOT_FOUND' => 'Evento não encontrado.',
            'EVENT_NOT_ACTIVE' => 'Este check-in não está ativo.',
            'CHECKIN_NOT_STARTED' => 'O check-in ainda não começou.',
            'CHECKIN_EXPIRED' => 'O período de check-in foi encerrado.',
            'ALREADY_CHECKED_IN' => 'Você já confirmou presença neste evento. O pacote já foi gerado na sua conta.',
            'LOCATION_REQUIRED' => 'Não foi possível obter sua localização.',
            'LOCATION_ACCURACY_TOO_LOW' => 'Sua localização está imprecisa. Ative o GPS e tente novamente.',
            'OUTSIDE_ALLOWED_RADIUS' => 'Você está fora da área permitida para este check-in.',
            'USER_NOT_APPROVED' => 'Seu cadastro ainda precisa ser aprovado.',
            'REWARD_CONFIGURATION_INVALID' => 'A recompensa deste evento não está configurada corretamente.',
            default => 'Não foi possível confirmar sua presença.',
        };
    }

    private function auditRejected(
        EventCheckinException $exception,
        User $user,
        ?Activity $event,
        ?int $distanceMeters,
        ?int $accuracyMeters,
    ): void {
        $this->auditLogger->log(
            action: 'event_checkin.rejected',
            actor: $user,
            target: $user,
            entityType: Activity::class,
            entityId: $event?->id,
            metadata: [
                'code' => $exception->reason,
                'event_id' => $event?->id,
                'user_id' => $user->id,
                'distance_meters' => $distanceMeters,
                'accuracy_meters' => $accuracyMeters,
                'radius_meters' => $event?->radius_meters,
                'max_accuracy_meters' => $event?->max_accuracy_meters,
            ],
        );
    }

    private function haversineMeters(float $eventLatitude, float $eventLongitude, float $userLatitude, float $userLongitude): int
    {
        $earthRadius = 6371000.0;

        $dLat = deg2rad($userLatitude - $eventLatitude);
        $dLon = deg2rad($userLongitude - $eventLongitude);

        $lat1 = deg2rad($eventLatitude);
        $lat2 = deg2rad($userLatitude);

        $a = sin($dLat / 2) ** 2
            + cos($lat1) * cos($lat2) * sin($dLon / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return (int) round($earthRadius * $c);
    }
}
