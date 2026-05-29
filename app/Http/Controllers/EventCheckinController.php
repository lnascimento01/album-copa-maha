<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConfirmEventCheckinRequest;
use App\Models\Activity;
use App\Models\User;
use App\Services\Activities\ConfirmEventActivityCheckinService;
use App\Services\Activities\Exceptions\EventCheckinException;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EventCheckinController extends Controller
{
    public function __construct(
        private readonly ConfirmEventActivityCheckinService $confirmEventActivityCheckinService,
    ) {}

    public function showByToken(string $token): Response
    {
        /** @var User $user */
        $user = request()->user();

        $event = $this->confirmEventActivityCheckinService->findEventByToken($token);
        $preview = $this->confirmEventActivityCheckinService->previewByToken($token, $user);

        return Inertia::render('checkin/event', [
            'token' => $token,
            'event' => $event ? $this->serializeEvent($event) : null,
            'status' => $preview['status'],
            'message' => $preview['message'],
            'alreadyCheckedIn' => $preview['already_checked_in'],
        ]);
    }

    public function confirmByToken(ConfirmEventCheckinRequest $request, string $token): RedirectResponse
    {
        /** @var User $user */
        $user = request()->user();

        try {
            $result = $this->confirmEventActivityCheckinService->confirmByToken(
                token: $token,
                user: $user,
                latitude: (float) $request->validated('latitude'),
                longitude: (float) $request->validated('longitude'),
                accuracy: (float) $request->validated('accuracy'),
            );
            $packCount = count($result['pack_ids']);

            return redirect()->route('checkin.event.show', ['token' => $token])->with([
                'success' => sprintf(
                    'Check-in confirmado! Você recebeu %d %s.',
                    $packCount,
                    $packCount === 1 ? 'pacote' : 'pacotes',
                ),
                'eventCheckinResult' => [
                    'checkin_id' => $result['checkin']->id,
                    'pack_ids' => $result['pack_ids'],
                    'distance_meters' => $result['distance_meters'],
                    'accuracy_meters' => $result['accuracy_meters'],
                ],
            ]);
        } catch (EventCheckinException $exception) {
            return back()->withErrors([
                'checkin' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeEvent(Activity $event): array
    {
        $timezone = $event->event_timezone ?: 'America/Sao_Paulo';

        return [
            'id' => $event->id,
            'title' => $event->title,
            'description' => $event->description,
            'status' => $event->status,
            'location_name' => $event->location_name,
            'latitude' => $event->latitude,
            'longitude' => $event->longitude,
            'radius_meters' => $event->radius_meters,
            'max_accuracy_meters' => $event->max_accuracy_meters,
            'event_timezone' => $event->event_timezone,
            'starts_at' => optional($event->starts_at)?->copy()->setTimezone($timezone)->toIso8601String(),
            'ends_at' => optional($event->ends_at)?->copy()->setTimezone($timezone)->toIso8601String(),
            'reward_pack_quantity' => $event->reward_pack_quantity,
            'reward_pack_size' => $event->reward_pack_size,
        ];
    }
}
