<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CancelActivityRequest;
use App\Http\Requests\StoreActivityRequest;
use App\Http\Requests\UpdateActivityRequest;
use App\Models\Activity;
use App\Models\ActivityCheckin;
use App\Models\ActivityCheckinSession;
use App\Models\Album;
use App\Models\AuditLog;
use App\Models\Team;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use Illuminate\Support\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use DateTimeInterface;

class ActivityController extends Controller
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Activity::class);

        $filters = [
            'search' => $request->string('search')->toString(),
            'status' => $request->string('status')->toString(),
            'type' => $request->string('type')->toString(),
            'team_id' => $request->integer('team_id') ?: null,
            'album_id' => $request->integer('album_id') ?: null,
            'date_from' => $request->string('date_from')->toString(),
            'date_to' => $request->string('date_to')->toString(),
        ];

        $activities = Activity::query()
            ->with(['team:id,name,slug', 'album:id,name,slug'])
            ->withCount(['checkins', 'stickerPacks'])
            ->when($filters['search'] !== '', function ($query) use ($filters) {
                $search = $filters['search'];

                $query->where(function ($inner) use ($search) {
                    $inner->where('title', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['type'] !== '', fn ($query) => $query->where('type', $filters['type']))
            ->when($filters['team_id'] !== null, fn ($query) => $query->where('team_id', $filters['team_id']))
            ->when($filters['album_id'] !== null, fn ($query) => $query->where('album_id', $filters['album_id']))
            ->when($filters['date_from'] !== '', fn ($query) => $query->whereDate('starts_at', '>=', $filters['date_from']))
            ->when($filters['date_to'] !== '', fn ($query) => $query->whereDate('starts_at', '<=', $filters['date_to']))
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Activity $activity): array => [
                'id' => $activity->id,
                'title' => $activity->title,
                'slug' => $activity->slug,
                'type' => $activity->type,
                'status' => $activity->status,
                'starts_at' => optional($activity->starts_at)?->toDateTimeString(),
                'reward_pack_quantity' => $activity->reward_pack_quantity,
                'reward_pack_size' => $activity->reward_pack_size,
                'checkins_count' => $activity->checkins_count,
                'sticker_packs_count' => $activity->sticker_packs_count,
                'team' => $activity->team,
                'album' => $activity->album,
            ]);

        return Inertia::render('admin/activities/index', [
            'activities' => $activities,
            'filters' => $filters,
            'statuses' => Activity::STATUSES,
            'types' => Activity::TYPES,
            'teams' => Team::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'albums' => Album::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Activity::class);

        return Inertia::render('admin/activities/create', [
            'teams' => Team::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'albums' => Album::query()->where('status', Album::STATUS_ACTIVE)->orderBy('name')->get(['id', 'name', 'team_id']),
            'types' => Activity::TYPES,
            'statuses' => Activity::STATUSES,
        ]);
    }

    public function store(StoreActivityRequest $request): RedirectResponse
    {
        $this->authorize('create', Activity::class);

        $payload = $this->normalizeEventConfig(
            type: (string) $request->validated('type'),
            payload: $request->validated(),
        );

        $activity = Activity::query()->create([
            ...$payload,
            'status' => Activity::STATUS_DRAFT,
            'created_by' => $request->user()?->id,
            'updated_by' => $request->user()?->id,
            'opened_at' => null,
            'closed_at' => null,
            'cancelled_at' => null,
            'cancellation_reason' => null,
        ]);

        $this->auditLogger->log(
            action: 'activity.created',
            actor: $request->user(),
            entityType: Activity::class,
            entityId: $activity->id,
            metadata: [
                'activity_id' => $activity->id,
                'team_id' => $activity->team_id,
                'album_id' => $activity->album_id,
                'status' => $activity->status,
            ],
        );

        return redirect()->route('admin.activities.show', $activity)
            ->with('success', 'Atividade criada com sucesso.');
    }

    public function show(Request $request, Activity $activity): Response
    {
        $this->authorize('view', $activity);

        $activity->load([
            'team:id,name,slug',
            'album:id,name,slug,status',
            'creator:id,name,email',
            'updater:id,name,email',
            'checkinSessions' => fn ($query) => $query
                ->with(['creator:id,name,email', 'revokedBy:id,name,email'])
                ->orderByDesc('id'),
            'checkins' => fn ($query) => $query->with(['user:id,name,email', 'checkedBy:id,name,email', 'revokedBy:id,name,email'])
                ->withCount('stickerPacks')
                ->orderByDesc('id'),
        ])->loadCount(['checkins', 'stickerPacks']);

        $approvedUsers = User::query()
            ->where('approval_status', User::APPROVAL_APPROVED)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $auditLogs = AuditLog::query()
            ->with(['actor:id,name,email', 'target:id,name,email'])
            ->where(function ($query) use ($activity) {
                $query->where('entity_type', Activity::class)
                    ->where('entity_id', $activity->id);
            })
            ->orWhere(function ($query) use ($activity) {
                $query->where('entity_type', ActivityCheckin::class)
                    ->whereIn('entity_id', $activity->checkins->pluck('id')->all());
            })
            ->orWhere(function ($query) use ($activity) {
                $query->where('entity_type', ActivityCheckinSession::class)
                    ->whereIn('entity_id', $activity->checkinSessions->pluck('id')->all());
            })
            ->orderByDesc('id')
            ->limit(50)
            ->get()
            ->map(fn (AuditLog $log): array => [
                'id' => $log->id,
                'action' => $log->action,
                'created_at' => optional($log->created_at)?->toDateTimeString(),
                'metadata' => $log->metadata,
                'actor' => $log->actor,
                'target' => $log->target,
            ])
            ->values();

        return Inertia::render('admin/activities/show', [
            'activity' => [
                'id' => $activity->id,
                'team_id' => $activity->team_id,
                'album_id' => $activity->album_id,
                'title' => $activity->title,
                'slug' => $activity->slug,
                'type' => $activity->type,
                'status' => $activity->status,
                'description' => $activity->description,
                'location_name' => $activity->location_name,
                'latitude' => $activity->latitude,
                'longitude' => $activity->longitude,
                'radius_meters' => $activity->radius_meters,
                'max_accuracy_meters' => $activity->max_accuracy_meters,
                'event_timezone' => $activity->event_timezone,
                'event_token' => $activity->event_token,
                'event_url' => $activity->event_token ? url('/checkin/event/'.$activity->event_token) : null,
                'starts_at' => $this->formatActivityDateForDisplay(
                    value: $activity->starts_at,
                    timezone: $activity->type === Activity::TYPE_EVENT ? $activity->event_timezone : null,
                ),
                'ends_at' => $this->formatActivityDateForDisplay(
                    value: $activity->ends_at,
                    timezone: $activity->type === Activity::TYPE_EVENT ? $activity->event_timezone : null,
                ),
                'starts_at_display' => $this->formatActivityDateForDisplay(
                    value: $activity->starts_at,
                    timezone: $activity->type === Activity::TYPE_EVENT ? $activity->event_timezone : null,
                ),
                'ends_at_display' => $this->formatActivityDateForDisplay(
                    value: $activity->ends_at,
                    timezone: $activity->type === Activity::TYPE_EVENT ? $activity->event_timezone : null,
                ),
                'reward_pack_quantity' => $activity->reward_pack_quantity,
                'reward_pack_size' => $activity->reward_pack_size,
                'opened_at' => optional($activity->opened_at)?->toDateTimeString(),
                'closed_at' => optional($activity->closed_at)?->toDateTimeString(),
                'cancelled_at' => optional($activity->cancelled_at)?->toDateTimeString(),
                'cancellation_reason' => $activity->cancellation_reason,
                'metadata' => $activity->metadata,
                'team' => $activity->team,
                'album' => $activity->album,
                'creator' => $activity->creator,
                'updater' => $activity->updater,
                'checkins_count' => $activity->checkins_count,
                'sticker_packs_count' => $activity->sticker_packs_count,
            ],
            'checkins' => $activity->checkins->map(fn ($checkin): array => [
                'id' => $checkin->id,
                'status' => $checkin->status,
                'checked_at' => optional($checkin->checked_at)?->toDateTimeString(),
                'revoked_at' => optional($checkin->revoked_at)?->toDateTimeString(),
                'revoke_reason' => $checkin->revoke_reason,
                'notes' => $checkin->notes,
                'sticker_packs_count' => $checkin->sticker_packs_count,
                'user' => $checkin->user,
                'checked_by' => $checkin->checkedBy,
                'revoked_by' => $checkin->revokedBy,
            ])->values()->all(),
            'approvedUsers' => $approvedUsers,
            'checkinSessions' => $activity->checkinSessions->map(fn ($session): array => [
                'id' => $session->id,
                'status' => $session->status,
                'public_code' => $session->public_code,
                'starts_at' => optional($session->starts_at)?->toDateTimeString(),
                'expires_at' => optional($session->expires_at)?->toDateTimeString(),
                'max_uses' => $session->max_uses,
                'used_count' => $session->used_count,
                'revoked_at' => optional($session->revoked_at)?->toDateTimeString(),
                'revoke_reason' => $session->revoke_reason,
                'creator' => $session->creator,
                'revoked_by' => $session->revokedBy,
            ])->values()->all(),
            'auditLogs' => $auditLogs,
            'can' => [
                'open' => $request->user()?->can('open', $activity) ?? false,
                'close' => $request->user()?->can('close', $activity) ?? false,
                'cancel' => $request->user()?->can('cancel', $activity) ?? false,
                'checkinCreate' => $request->user()?->hasPermission('activityCheckins.create') ?? false,
                'checkinRevoke' => $request->user()?->hasPermission('activityCheckins.revoke') ?? false,
                'sessionCreate' => $request->user()?->hasPermission('activityCheckinSessions.create') ?? false,
                'sessionRevoke' => $request->user()?->hasPermission('activityCheckinSessions.revoke') ?? false,
            ],
        ]);
    }

    public function edit(Activity $activity): Response
    {
        $this->authorize('update', $activity);

        if (! $this->canEditActivity($activity)) {
            abort(403);
        }

        return Inertia::render('admin/activities/edit', [
            'activity' => [
                'id' => $activity->id,
                'team_id' => $activity->team_id,
                'album_id' => $activity->album_id,
                'title' => $activity->title,
                'slug' => $activity->slug,
                'type' => $activity->type,
                'description' => $activity->description,
                'location_name' => $activity->location_name,
                'latitude' => $activity->latitude,
                'longitude' => $activity->longitude,
                'radius_meters' => $activity->radius_meters,
                'max_accuracy_meters' => $activity->max_accuracy_meters,
                'event_timezone' => $activity->event_timezone,
                'starts_at' => $this->formatActivityDateForForm(
                    value: $activity->starts_at,
                    timezone: $activity->type === Activity::TYPE_EVENT ? $activity->event_timezone : null,
                ),
                'ends_at' => $this->formatActivityDateForForm(
                    value: $activity->ends_at,
                    timezone: $activity->type === Activity::TYPE_EVENT ? $activity->event_timezone : null,
                ),
                'reward_pack_quantity' => $activity->reward_pack_quantity,
                'reward_pack_size' => $activity->reward_pack_size,
            ],
            'teams' => Team::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'albums' => Album::query()->where('status', Album::STATUS_ACTIVE)->orderBy('name')->get(['id', 'name', 'team_id']),
            'types' => Activity::TYPES,
        ]);
    }

    public function update(UpdateActivityRequest $request, Activity $activity): RedirectResponse
    {
        $this->authorize('update', $activity);

        if (! $this->canEditActivity($activity)) {
            return back()->withErrors([
                'activity' => 'Somente atividades em rascunho ou eventos abertos podem ser editados.',
            ]);
        }

        $activity->fill([
            ...$this->normalizeEventConfig(
                type: (string) $request->validated('type'),
                payload: $request->validated(),
                existingToken: $activity->event_token,
            ),
            'updated_by' => $request->user()?->id,
        ])->save();

        $this->auditLogger->log(
            action: 'activity.updated',
            actor: $request->user(),
            entityType: Activity::class,
            entityId: $activity->id,
            metadata: [
                'activity_id' => $activity->id,
                'team_id' => $activity->team_id,
                'album_id' => $activity->album_id,
            ],
        );

        return redirect()->route('admin.activities.show', $activity)
            ->with('success', 'Atividade atualizada com sucesso.');
    }

    public function open(Request $request, Activity $activity): RedirectResponse
    {
        $this->authorize('open', $activity);

        if ($activity->status !== Activity::STATUS_DRAFT) {
            return back()->withErrors([
                'activity' => 'Somente atividades em rascunho podem ser abertas.',
            ]);
        }

        if ($activity->album->status !== Album::STATUS_ACTIVE) {
            return back()->withErrors([
                'activity' => 'Não é possível abrir atividade vinculada a álbum não ativo.',
            ]);
        }

        $activity->forceFill([
            'status' => Activity::STATUS_OPEN,
            'opened_at' => now(),
            'closed_at' => null,
            'cancelled_at' => null,
            'cancellation_reason' => null,
            'updated_by' => $request->user()?->id,
        ])->save();

        $this->auditLogger->log(
            action: 'activity.opened',
            actor: $request->user(),
            entityType: Activity::class,
            entityId: $activity->id,
            metadata: [
                'activity_id' => $activity->id,
                'team_id' => $activity->team_id,
                'album_id' => $activity->album_id,
            ],
        );

        return back()->with('success', 'Atividade aberta com sucesso.');
    }

    public function close(Request $request, Activity $activity): RedirectResponse
    {
        $this->authorize('close', $activity);

        if ($activity->status !== Activity::STATUS_OPEN) {
            return back()->withErrors([
                'activity' => 'Somente atividades abertas podem ser fechadas.',
            ]);
        }

        $activity->forceFill([
            'status' => Activity::STATUS_CLOSED,
            'closed_at' => now(),
            'updated_by' => $request->user()?->id,
        ])->save();

        $this->auditLogger->log(
            action: 'activity.closed',
            actor: $request->user(),
            entityType: Activity::class,
            entityId: $activity->id,
            metadata: [
                'activity_id' => $activity->id,
                'team_id' => $activity->team_id,
                'album_id' => $activity->album_id,
            ],
        );

        return back()->with('success', 'Atividade fechada com sucesso.');
    }

    public function cancel(CancelActivityRequest $request, Activity $activity): RedirectResponse
    {
        $this->authorize('cancel', $activity);

        if (! in_array($activity->status, [Activity::STATUS_DRAFT, Activity::STATUS_OPEN], true)) {
            return back()->withErrors([
                'activity' => 'Somente atividades em rascunho ou abertas podem ser canceladas.',
            ]);
        }

        $activity->forceFill([
            'status' => Activity::STATUS_CANCELLED,
            'cancelled_at' => now(),
            'cancellation_reason' => $request->validated('cancellation_reason'),
            'updated_by' => $request->user()?->id,
        ])->save();

        $this->auditLogger->log(
            action: 'activity.cancelled',
            actor: $request->user(),
            entityType: Activity::class,
            entityId: $activity->id,
            metadata: [
                'activity_id' => $activity->id,
                'team_id' => $activity->team_id,
                'album_id' => $activity->album_id,
                'reason' => $activity->cancellation_reason,
            ],
        );

        return back()->with('success', 'Atividade cancelada com sucesso.');
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function normalizeEventConfig(string $type, array $payload, ?string $existingToken = null): array
    {
        if ($type !== Activity::TYPE_EVENT) {
            return [
                ...$payload,
                'location_name' => null,
                'latitude' => null,
                'longitude' => null,
                'radius_meters' => 150,
                'max_accuracy_meters' => 100,
                'event_timezone' => 'America/Sao_Paulo',
                'event_token' => null,
            ];
        }

        return [
            ...$payload,
            'starts_at' => $this->normalizeEventDateForStorage(
                value: $payload['starts_at'] ?? null,
                timezone: (string) ($payload['event_timezone'] ?? 'America/Sao_Paulo'),
            ),
            'ends_at' => $this->normalizeEventDateForStorage(
                value: $payload['ends_at'] ?? null,
                timezone: (string) ($payload['event_timezone'] ?? 'America/Sao_Paulo'),
            ),
            'radius_meters' => (int) ($payload['radius_meters'] ?? 150),
            'max_accuracy_meters' => (int) ($payload['max_accuracy_meters'] ?? 100),
            'event_timezone' => (string) ($payload['event_timezone'] ?? 'America/Sao_Paulo'),
            'event_token' => $existingToken ?: $this->generateUniqueEventToken(),
        ];
    }

    private function generateUniqueEventToken(): string
    {
        do {
            $token = Str::lower(Str::random(48));
        } while (Activity::query()->where('event_token', $token)->exists());

        return $token;
    }

    private function normalizeEventDateForStorage(mixed $value, string $timezone): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        return Carbon::parse($value, $timezone)->utc()->toDateTimeString();
    }

    private function formatActivityDateForForm(?DateTimeInterface $value, ?string $timezone): ?string
    {
        if (! $value instanceof DateTimeInterface) {
            return null;
        }

        $formatted = Carbon::instance($value);

        if (is_string($timezone) && trim($timezone) !== '') {
            $formatted = $formatted->setTimezone($timezone);
        }

        return $formatted->format('Y-m-d\\TH:i');
    }

    private function formatActivityDateForDisplay(?DateTimeInterface $value, ?string $timezone): ?string
    {
        if (! $value instanceof DateTimeInterface) {
            return null;
        }

        $formatted = Carbon::instance($value);

        if (is_string($timezone) && trim($timezone) !== '') {
            $formatted = $formatted->setTimezone($timezone);
        }

        return $formatted->format('d/m/Y H:i');
    }

    private function canEditActivity(Activity $activity): bool
    {
        if ($activity->status === Activity::STATUS_DRAFT) {
            return true;
        }

        return $activity->type === Activity::TYPE_EVENT && $activity->status === Activity::STATUS_OPEN;
    }
}
