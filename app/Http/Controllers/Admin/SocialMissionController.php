<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CancelSocialMissionRequest;
use App\Http\Requests\StoreSocialMissionRequest;
use App\Http\Requests\UpdateSocialMissionRequest;
use App\Models\Album;
use App\Models\AuditLog;
use App\Models\SocialMission;
use App\Models\SocialMissionSubmission;
use App\Models\Team;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SocialMissionController extends Controller
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', SocialMission::class);

        $filters = [
            'search' => $request->string('search')->toString(),
            'status' => $request->string('status')->toString(),
            'type' => $request->string('type')->toString(),
            'team_id' => $request->integer('team_id') ?: null,
            'album_id' => $request->integer('album_id') ?: null,
        ];

        $missions = SocialMission::query()
            ->with(['team:id,name,slug', 'album:id,name,slug'])
            ->withCount([
                'submissions as submissions_pending_count' => fn ($query) => $query->where('status', SocialMissionSubmission::STATUS_PENDING),
                'submissions as submissions_approved_count' => fn ($query) => $query->where('status', SocialMissionSubmission::STATUS_APPROVED),
            ])
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
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (SocialMission $mission): array => [
                'id' => $mission->id,
                'title' => $mission->title,
                'slug' => $mission->slug,
                'type' => $mission->type,
                'status' => $mission->status,
                'reward_pack_quantity' => $mission->reward_pack_quantity,
                'reward_pack_size' => $mission->reward_pack_size,
                'starts_at' => optional($mission->starts_at)?->toDateTimeString(),
                'ends_at' => optional($mission->ends_at)?->toDateTimeString(),
                'submissions_pending_count' => $mission->submissions_pending_count,
                'submissions_approved_count' => $mission->submissions_approved_count,
                'team' => $mission->team,
                'album' => $mission->album,
            ]);

        return Inertia::render('admin/social-missions/index', [
            'missions' => $missions,
            'filters' => $filters,
            'statuses' => SocialMission::STATUSES,
            'types' => SocialMission::TYPES,
            'teams' => Team::query()->orderBy('name')->get(['id', 'name']),
            'albums' => Album::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', SocialMission::class);

        return Inertia::render('admin/social-missions/create', [
            'teams' => Team::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'albums' => Album::query()->where('status', Album::STATUS_ACTIVE)->orderBy('name')->get(['id', 'name', 'team_id']),
            'statuses' => SocialMission::STATUSES,
            'types' => SocialMission::TYPES,
        ]);
    }

    public function store(StoreSocialMissionRequest $request): RedirectResponse
    {
        $this->authorize('create', SocialMission::class);

        $mission = SocialMission::query()->create([
            ...$request->validated(),
            'status' => SocialMission::STATUS_DRAFT,
            'created_by' => $request->user()?->id,
            'updated_by' => $request->user()?->id,
            'approved_count' => 0,
        ]);

        $this->auditLogger->log(
            action: 'social_mission.created',
            actor: $request->user(),
            entityType: SocialMission::class,
            entityId: $mission->id,
            metadata: [
                'social_mission_id' => $mission->id,
                'team_id' => $mission->team_id,
                'album_id' => $mission->album_id,
            ],
        );

        return redirect()->route('admin.social-missions.show', $mission)
            ->with('success', 'Missão social criada com sucesso.');
    }

    public function show(SocialMission $socialMission): Response
    {
        $this->authorize('view', $socialMission);

        $socialMission->load([
            'team:id,name,slug',
            'album:id,name,slug,status',
            'creator:id,name,email',
            'updater:id,name,email',
            'cancelledBy:id,name,email',
            'submissions' => fn ($query) => $query->with(['user:id,name,email', 'reviewer:id,name,email'])->orderByDesc('id')->limit(100),
            'stickerPacks' => fn ($query) => $query->with(['user:id,name,email'])->orderByDesc('id')->limit(100),
        ])->loadCount([
            'submissions as submissions_pending_count' => fn ($query) => $query->where('status', SocialMissionSubmission::STATUS_PENDING),
            'submissions as submissions_approved_count' => fn ($query) => $query->where('status', SocialMissionSubmission::STATUS_APPROVED),
            'submissions as submissions_rejected_count' => fn ($query) => $query->where('status', SocialMissionSubmission::STATUS_REJECTED),
        ]);

        $auditLogs = AuditLog::query()
            ->with(['actor:id,name,email', 'target:id,name,email'])
            ->where(function ($query) use ($socialMission) {
                $query->where('entity_type', SocialMission::class)
                    ->where('entity_id', $socialMission->id);
            })
            ->orWhere(function ($query) use ($socialMission) {
                $query->where('entity_type', SocialMissionSubmission::class)
                    ->whereIn('entity_id', $socialMission->submissions->pluck('id')->all());
            })
            ->orderByDesc('id')
            ->limit(40)
            ->get()
            ->map(fn (AuditLog $log): array => [
                'id' => $log->id,
                'action' => $log->action,
                'metadata' => $log->metadata,
                'created_at' => optional($log->created_at)?->toDateTimeString(),
                'actor' => $log->actor,
                'target' => $log->target,
            ])
            ->values();

        return Inertia::render('admin/social-missions/show', [
            'mission' => [
                'id' => $socialMission->id,
                'title' => $socialMission->title,
                'slug' => $socialMission->slug,
                'description' => $socialMission->description,
                'instructions' => $socialMission->instructions,
                'type' => $socialMission->type,
                'status' => $socialMission->status,
                'validation_mode' => $socialMission->validation_mode,
                'reward_pack_quantity' => $socialMission->reward_pack_quantity,
                'reward_pack_size' => $socialMission->reward_pack_size,
                'starts_at' => optional($socialMission->starts_at)?->toDateTimeString(),
                'ends_at' => optional($socialMission->ends_at)?->toDateTimeString(),
                'max_submissions_total' => $socialMission->max_submissions_total,
                'max_submissions_per_user' => $socialMission->max_submissions_per_user,
                'approved_count' => $socialMission->approved_count,
                'submissions_pending_count' => $socialMission->submissions_pending_count,
                'submissions_approved_count' => $socialMission->submissions_approved_count,
                'submissions_rejected_count' => $socialMission->submissions_rejected_count,
                'cancellation_reason' => $socialMission->cancellation_reason,
                'cancelled_at' => optional($socialMission->cancelled_at)?->toDateTimeString(),
                'team' => $socialMission->team,
                'album' => $socialMission->album,
                'creator' => $socialMission->creator,
                'updater' => $socialMission->updater,
                'cancelled_by' => $socialMission->cancelledBy,
                'submissions' => $socialMission->submissions->map(fn ($submission): array => [
                    'id' => $submission->id,
                    'status' => $submission->status,
                    'evidence_text' => $submission->evidence_text,
                    'evidence_url' => $submission->evidence_url,
                    'submitted_at' => optional($submission->submitted_at)?->toDateTimeString(),
                    'reviewed_at' => optional($submission->reviewed_at)?->toDateTimeString(),
                    'rejection_reason' => $submission->rejection_reason,
                    'user' => $submission->user,
                    'reviewer' => $submission->reviewer,
                ])->values()->all(),
                'sticker_packs' => $socialMission->stickerPacks->map(fn ($pack): array => [
                    'id' => $pack->id,
                    'status' => $pack->status,
                    'source' => $pack->source,
                    'user' => $pack->user,
                    'created_at' => optional($pack->created_at)?->toDateTimeString(),
                ])->values()->all(),
            ],
            'shareText' => sprintf(
                'Missão MAHA: %s. Recompensa: %d pacote(s) de %d figurinhas. Envie sua evidência no app.',
                $socialMission->title,
                $socialMission->reward_pack_quantity,
                $socialMission->reward_pack_size,
            ),
            'auditLogs' => $auditLogs,
        ]);
    }

    public function edit(SocialMission $socialMission): Response
    {
        $this->authorize('update', $socialMission);

        if ($socialMission->status !== SocialMission::STATUS_DRAFT) {
            abort(403);
        }

        return Inertia::render('admin/social-missions/edit', [
            'mission' => [
                'id' => $socialMission->id,
                'team_id' => $socialMission->team_id,
                'album_id' => $socialMission->album_id,
                'title' => $socialMission->title,
                'slug' => $socialMission->slug,
                'description' => $socialMission->description,
                'instructions' => $socialMission->instructions,
                'type' => $socialMission->type,
                'status' => $socialMission->status,
                'validation_mode' => $socialMission->validation_mode,
                'reward_pack_quantity' => $socialMission->reward_pack_quantity,
                'reward_pack_size' => $socialMission->reward_pack_size,
                'starts_at' => optional($socialMission->starts_at)?->format('Y-m-d\\TH:i'),
                'ends_at' => optional($socialMission->ends_at)?->format('Y-m-d\\TH:i'),
                'max_submissions_total' => $socialMission->max_submissions_total,
                'max_submissions_per_user' => $socialMission->max_submissions_per_user,
            ],
            'teams' => Team::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'albums' => Album::query()->where('status', Album::STATUS_ACTIVE)->orderBy('name')->get(['id', 'name', 'team_id']),
            'statuses' => SocialMission::STATUSES,
            'types' => SocialMission::TYPES,
        ]);
    }

    public function update(UpdateSocialMissionRequest $request, SocialMission $socialMission): RedirectResponse
    {
        $this->authorize('update', $socialMission);

        if ($socialMission->status !== SocialMission::STATUS_DRAFT) {
            return back()->withErrors(['mission' => 'Somente missões em rascunho podem ser editadas.']);
        }

        $socialMission->fill([
            ...$request->validated(),
            'updated_by' => $request->user()?->id,
        ])->save();

        $this->auditLogger->log(
            action: 'social_mission.updated',
            actor: $request->user(),
            entityType: SocialMission::class,
            entityId: $socialMission->id,
            metadata: [
                'social_mission_id' => $socialMission->id,
            ],
        );

        return redirect()->route('admin.social-missions.show', $socialMission)
            ->with('success', 'Missão social atualizada com sucesso.');
    }

    public function activate(Request $request, SocialMission $socialMission): RedirectResponse
    {
        $this->authorize('activate', $socialMission);

        if ($socialMission->status !== SocialMission::STATUS_DRAFT) {
            return back()->withErrors(['mission' => 'Somente missões draft podem ser ativadas.']);
        }

        if ($socialMission->album->status !== Album::STATUS_ACTIVE) {
            return back()->withErrors(['mission' => 'Não é possível ativar missão com álbum não ativo.']);
        }

        $socialMission->forceFill([
            'status' => SocialMission::STATUS_ACTIVE,
            'updated_by' => $request->user()?->id,
            'cancelled_at' => null,
            'cancelled_by' => null,
            'cancellation_reason' => null,
        ])->save();

        $this->auditLogger->log(
            action: 'social_mission.activated',
            actor: $request->user(),
            entityType: SocialMission::class,
            entityId: $socialMission->id,
            metadata: [
                'social_mission_id' => $socialMission->id,
            ],
        );

        return back()->with('success', 'Missão ativada com sucesso.');
    }

    public function close(Request $request, SocialMission $socialMission): RedirectResponse
    {
        $this->authorize('close', $socialMission);

        if ($socialMission->status !== SocialMission::STATUS_ACTIVE) {
            return back()->withErrors(['mission' => 'Somente missões ativas podem ser encerradas.']);
        }

        $socialMission->forceFill([
            'status' => SocialMission::STATUS_CLOSED,
            'updated_by' => $request->user()?->id,
        ])->save();

        $this->auditLogger->log(
            action: 'social_mission.closed',
            actor: $request->user(),
            entityType: SocialMission::class,
            entityId: $socialMission->id,
            metadata: [
                'social_mission_id' => $socialMission->id,
            ],
        );

        return back()->with('success', 'Missão encerrada com sucesso.');
    }

    public function cancel(CancelSocialMissionRequest $request, SocialMission $socialMission): RedirectResponse
    {
        $this->authorize('cancel', $socialMission);

        if (! in_array($socialMission->status, [SocialMission::STATUS_DRAFT, SocialMission::STATUS_ACTIVE], true)) {
            return back()->withErrors(['mission' => 'Somente missões draft ou active podem ser canceladas.']);
        }

        $socialMission->forceFill([
            'status' => SocialMission::STATUS_CANCELLED,
            'cancelled_by' => $request->user()?->id,
            'cancelled_at' => now(),
            'cancellation_reason' => $request->validated('cancellation_reason'),
            'updated_by' => $request->user()?->id,
        ])->save();

        $this->auditLogger->log(
            action: 'social_mission.cancelled',
            actor: $request->user(),
            entityType: SocialMission::class,
            entityId: $socialMission->id,
            metadata: [
                'social_mission_id' => $socialMission->id,
                'reason' => $socialMission->cancellation_reason,
            ],
        );

        return back()->with('success', 'Missão cancelada com sucesso.');
    }
}
