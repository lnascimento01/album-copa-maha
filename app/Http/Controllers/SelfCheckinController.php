<?php

namespace App\Http\Controllers;

use App\Http\Requests\SelfCheckinCodeRequest;
use App\Models\ActivityCheckin;
use App\Models\ActivityCheckinSession;
use App\Models\Album;
use App\Models\User;
use App\Services\Achievements\EvaluateUserAchievementsService;
use App\Services\Activities\ConfirmSelfActivityCheckinService;
use App\Services\Activities\Exceptions\ActivityCheckinException;
use App\Services\ShareCards\CreateShareCardService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SelfCheckinController extends Controller
{
    public function __construct(
        private readonly ConfirmSelfActivityCheckinService $confirmSelfActivityCheckinService,
        private readonly EvaluateUserAchievementsService $evaluateUserAchievementsService,
        private readonly CreateShareCardService $createShareCardService,
    ) {}

    public function showByToken(string $token): Response
    {
        /** @var User $user */
        $user = request()->user();

        $session = $this->confirmSelfActivityCheckinService->resolveSessionByToken($token);

        $view = $this->buildTokenViewPayload($session, $user);

        return Inertia::render('checkin/token', $view);
    }

    public function confirmByToken(string $token): RedirectResponse
    {
        /** @var User $user */
        $user = request()->user();

        try {
            $result = $this->confirmSelfActivityCheckinService->confirmByToken($token, $user);
            $album = Album::query()->find($result['checkin']->activity->album_id ?? null);

            if ($album) {
                try {
                    $this->createShareCardService->createForUser(
                        user: $user,
                        type: 'checkin_confirmed',
                        album: $album,
                        title: 'Presença confirmada via QR Code',
                        subtitle: $result['checkin']->activity->title,
                        metric: count($result['pack_ids']),
                        related: [
                            'activity_id' => $result['checkin']->activity_id,
                            'checkin_id' => $result['checkin']->id,
                            'pack_ids' => $result['pack_ids'],
                            'self_checkin' => true,
                        ],
                    );

                    $this->evaluateUserAchievementsService->evaluate($user, $album);
                } catch (\Throwable) {
                    // Non-critical side effect: do not interrupt self check-in flow.
                }
            }

            return redirect()->route('checkin.token.show', ['token' => $token])->with([
                'success' => 'Presença confirmada.',
                'selfCheckinResult' => [
                    'checkin_id' => $result['checkin']->id,
                    'pack_ids' => $result['pack_ids'],
                ],
            ]);
        } catch (ActivityCheckinException $exception) {
            return back()->withErrors([
                'checkin' => $this->mapSelfCheckinErrorMessage($exception),
            ]);
        }
    }

    public function showByCodeForm(): Response
    {
        return Inertia::render('checkin/code');
    }

    public function confirmByCode(SelfCheckinCodeRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = request()->user();

        try {
            $result = $this->confirmSelfActivityCheckinService->confirmByCode(
                (string) $request->validated('code'),
                $user,
            );
            $album = Album::query()->find($result['checkin']->activity->album_id ?? null);

            if ($album) {
                try {
                    $this->createShareCardService->createForUser(
                        user: $user,
                        type: 'checkin_confirmed',
                        album: $album,
                        title: 'Presença confirmada por código',
                        subtitle: $result['checkin']->activity->title,
                        metric: count($result['pack_ids']),
                        related: [
                            'activity_id' => $result['checkin']->activity_id,
                            'checkin_id' => $result['checkin']->id,
                            'pack_ids' => $result['pack_ids'],
                            'self_checkin' => true,
                        ],
                    );

                    $this->evaluateUserAchievementsService->evaluate($user, $album);
                } catch (\Throwable) {
                    // Non-critical side effect: do not interrupt self check-in flow.
                }
            }

            return redirect()->route('checkins.show', $result['checkin'])
                ->with('success', 'Presença confirmada por código.');
        } catch (ActivityCheckinException $exception) {
            return back()->withErrors([
                'code' => $this->mapSelfCheckinErrorMessage($exception),
            ]);
        }
    }

    private function mapSelfCheckinErrorMessage(ActivityCheckinException $exception): string
    {
        return match ($exception->reason) {
            'session_not_started' => 'Este check-in ainda não está disponível.',
            'duplicate_checkin' => 'Você já confirmou presença nesta atividade.',
            'user_not_approved' => 'Sua conta ainda não está liberada para participar.',
            'invalid_token', 'invalid_code', 'session_revoked', 'session_expired', 'max_uses_reached', 'activity_not_open', 'album_not_active' => 'Este check-in não está mais disponível.',
            default => 'Não foi possível confirmar sua presença.',
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function buildTokenViewPayload(?ActivityCheckinSession $session, User $user): array
    {
        if (! $session) {
            return [
                'session' => null,
                'activity' => null,
                'status' => 'unavailable',
                'message' => 'Este check-in não está mais disponível.',
                'alreadyCheckedIn' => false,
            ];
        }

        $activity = $session->activity;

        $alreadyCheckin = ActivityCheckin::query()
            ->where('activity_id', $session->activity_id)
            ->where('user_id', $user->id)
            ->exists();

        $status = 'available';
        $message = 'Confirme sua presença para receber os pacotes desta atividade.';

        if ($alreadyCheckin) {
            $status = 'already';
            $message = 'Você já confirmou presença nesta atividade.';
        } elseif ($session->status === ActivityCheckinSession::STATUS_REVOKED || $activity->status !== 'open') {
            $status = 'unavailable';
            $message = 'Este check-in não está mais disponível.';
        } elseif ($session->starts_at && $session->starts_at->isFuture()) {
            $status = 'not_started';
            $message = 'Este check-in ainda não está disponível.';
        } elseif ($session->expires_at->isPast() || $session->status === ActivityCheckinSession::STATUS_EXPIRED) {
            $status = 'expired';
            $message = 'Este check-in não está mais disponível.';
        } elseif ($session->max_uses !== null && $session->used_count >= $session->max_uses) {
            $status = 'full';
            $message = 'Este check-in não está mais disponível.';
        }

        return [
            'session' => [
                'id' => $session->id,
                'status' => $session->status,
                'public_code' => $session->public_code,
                'starts_at' => optional($session->starts_at)?->toDateTimeString(),
                'expires_at' => optional($session->expires_at)?->toDateTimeString(),
                'max_uses' => $session->max_uses,
                'used_count' => $session->used_count,
            ],
            'activity' => [
                'id' => $activity->id,
                'title' => $activity->title,
                'type' => $activity->type,
                'status' => $activity->status,
                'starts_at' => optional($activity->starts_at)?->toDateTimeString(),
                'reward_pack_quantity' => $activity->reward_pack_quantity,
                'reward_pack_size' => $activity->reward_pack_size,
                'team' => $activity->team,
            ],
            'status' => $status,
            'message' => $message,
            'alreadyCheckedIn' => $alreadyCheckin,
        ];
    }
}
