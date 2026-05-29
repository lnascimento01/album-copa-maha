<?php

namespace App\Http\Controllers;

use App\Models\ActivityCheckin;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class ActivityHistoryController extends Controller
{
    public function index(): Response
    {
        /** @var User $user */
        $user = request()->user();

        $checkins = ActivityCheckin::query()
            ->with([
                'activity:id,title,type,status,team_id,album_id,starts_at',
                'activity.team:id,name,slug',
                'activity.album:id,name,slug',
            ])
            ->withCount('stickerPacks')
            ->where('user_id', $user->id)
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (ActivityCheckin $checkin): array => [
                'id' => $checkin->id,
                'status' => $checkin->status,
                'checked_at' => optional($checkin->checked_at)?->toDateTimeString(),
                'revoked_at' => optional($checkin->revoked_at)?->toDateTimeString(),
                'revoke_reason' => $checkin->revoke_reason,
                'sticker_packs_count' => $checkin->sticker_packs_count,
                'source' => $this->resolveCheckinSource($checkin),
                'activity' => [
                    'id' => $checkin->activity->id,
                    'title' => $checkin->activity->title,
                    'type' => $checkin->activity->type,
                    'status' => $checkin->activity->status,
                    'starts_at' => optional($checkin->activity->starts_at)?->toDateTimeString(),
                    'team' => $checkin->activity->team,
                    'album' => $checkin->activity->album,
                ],
            ]);

        return Inertia::render('checkins/index', [
            'checkins' => $checkins,
        ]);
    }

    public function show(ActivityCheckin $activityCheckin): Response
    {
        /** @var User $user */
        $user = request()->user();

        if ($activityCheckin->user_id !== $user->id) {
            abort(403);
        }

        $activityCheckin->load([
            'activity:id,title,type,status,description,starts_at,ends_at,team_id,album_id',
            'activity.team:id,name,slug',
            'activity.album:id,name,slug',
            'checkedBy:id,name,email',
            'stickerPacks:id,user_id,album_id,activity_id,activity_checkin_id,status,size,source,created_at,opened_at,cancelled_at',
        ]);

        return Inertia::render('checkins/show', [
            'checkin' => [
                'id' => $activityCheckin->id,
                'status' => $activityCheckin->status,
                'checked_at' => optional($activityCheckin->checked_at)?->toDateTimeString(),
                'revoked_at' => optional($activityCheckin->revoked_at)?->toDateTimeString(),
                'revoke_reason' => $activityCheckin->revoke_reason,
                'notes' => $activityCheckin->notes,
                'source' => $this->resolveCheckinSource($activityCheckin),
                'latitude' => $activityCheckin->latitude,
                'longitude' => $activityCheckin->longitude,
                'accuracy_meters' => $activityCheckin->accuracy_meters,
                'distance_meters' => $activityCheckin->distance_meters,
                'checked_by' => $activityCheckin->checkedBy,
                'activity' => [
                    'id' => $activityCheckin->activity->id,
                    'title' => $activityCheckin->activity->title,
                    'type' => $activityCheckin->activity->type,
                    'status' => $activityCheckin->activity->status,
                    'description' => $activityCheckin->activity->description,
                    'starts_at' => optional($activityCheckin->activity->starts_at)?->toDateTimeString(),
                    'ends_at' => optional($activityCheckin->activity->ends_at)?->toDateTimeString(),
                    'team' => $activityCheckin->activity->team,
                    'album' => $activityCheckin->activity->album,
                ],
                'packs' => $activityCheckin->stickerPacks->map(fn ($pack): array => [
                    'id' => $pack->id,
                    'status' => $pack->status,
                    'size' => $pack->size,
                    'source' => $pack->source,
                    'created_at' => optional($pack->created_at)?->toDateTimeString(),
                    'opened_at' => optional($pack->opened_at)?->toDateTimeString(),
                    'cancelled_at' => optional($pack->cancelled_at)?->toDateTimeString(),
                ])->values()->all(),
            ],
        ]);
    }

    private function resolveCheckinSource(ActivityCheckin $checkin): string
    {
        $metadata = is_array($checkin->metadata) ? $checkin->metadata : [];

        if ($metadata['event_checkin'] ?? false) {
            return 'event';
        }

        if ($metadata['self_checkin'] ?? false) {
            return 'self';
        }

        return 'admin';
    }
}
