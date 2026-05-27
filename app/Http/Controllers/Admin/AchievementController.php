<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\GrantAchievementRequest;
use App\Http\Requests\StoreAchievementRequest;
use App\Http\Requests\UpdateAchievementRequest;
use App\Models\Achievement;
use App\Models\Album;
use App\Models\AuditLog;
use App\Models\Team;
use App\Models\User;
use App\Models\UserAchievement;
use App\Services\Audit\AuditLogger;
use App\Services\ShareCards\CreateShareCardService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AchievementController extends Controller
{
    public function __construct(
        private readonly AuditLogger $auditLogger,
        private readonly CreateShareCardService $createShareCardService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Achievement::class);

        $filters = [
            'search' => $request->string('search')->toString(),
            'type' => $request->string('type')->toString(),
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : null,
            'team_id' => $request->integer('team_id') ?: null,
            'album_id' => $request->integer('album_id') ?: null,
        ];

        $achievements = Achievement::query()
            ->with(['team:id,name', 'album:id,name'])
            ->withCount('userAchievements')
            ->when($filters['search'] !== '', function ($query) use ($filters) {
                $search = $filters['search'];

                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->when($filters['type'] !== '', fn ($query) => $query->where('type', $filters['type']))
            ->when($filters['is_active'] !== null, fn ($query) => $query->where('is_active', $filters['is_active']))
            ->when($filters['team_id'] !== null, fn ($query) => $query->where('team_id', $filters['team_id']))
            ->when($filters['album_id'] !== null, fn ($query) => $query->where('album_id', $filters['album_id']))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Achievement $achievement): array => [
                'id' => $achievement->id,
                'name' => $achievement->name,
                'slug' => $achievement->slug,
                'type' => $achievement->type,
                'threshold' => $achievement->threshold,
                'is_active' => $achievement->is_active,
                'sort_order' => $achievement->sort_order,
                'team' => $achievement->team,
                'album' => $achievement->album,
                'unlocked_count' => $achievement->user_achievements_count,
            ]);

        return Inertia::render('admin/achievements/index', [
            'achievements' => $achievements,
            'types' => Achievement::TYPES,
            'filters' => $filters,
            'teams' => Team::query()->orderBy('name')->get(['id', 'name']),
            'albums' => Album::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Achievement::class);

        return Inertia::render('admin/achievements/create', [
            'types' => Achievement::TYPES,
            'teams' => Team::query()->orderBy('name')->get(['id', 'name']),
            'albums' => Album::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreAchievementRequest $request): RedirectResponse
    {
        $this->authorize('create', Achievement::class);

        $validated = $request->validated();

        if ($validated['type'] !== Achievement::TYPE_SPECIAL && ! isset($validated['threshold'])) {
            return back()->withErrors([
                'threshold' => 'Threshold é obrigatório para este tipo de conquista.',
            ])->withInput();
        }

        if ($validated['type'] === Achievement::TYPE_SPECIAL) {
            $validated['threshold'] = null;
        }

        $achievement = Achievement::query()->create($validated);

        $this->auditLogger->log(
            action: 'achievement.created',
            actor: $request->user(),
            entityType: Achievement::class,
            entityId: $achievement->id,
            metadata: [
                'achievement_id' => $achievement->id,
                'slug' => $achievement->slug,
                'type' => $achievement->type,
                'threshold' => $achievement->threshold,
            ],
        );

        return redirect()->route('admin.achievements.show', $achievement)
            ->with('success', 'Conquista criada com sucesso.');
    }

    public function show(Request $request, Achievement $achievement): Response
    {
        $this->authorize('view', $achievement);

        $achievement->load([
            'team:id,name',
            'album:id,name,slug',
            'userAchievements' => fn ($query) => $query->with(['user:id,name,email', 'album:id,name'])->orderByDesc('unlocked_at')->limit(100),
        ]);

        $auditLogs = AuditLog::query()
            ->with(['actor:id,name,email', 'target:id,name,email'])
            ->where('entity_type', Achievement::class)
            ->where('entity_id', $achievement->id)
            ->orderByDesc('id')
            ->limit(30)
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

        return Inertia::render('admin/achievements/show', [
            'achievement' => [
                'id' => $achievement->id,
                'name' => $achievement->name,
                'slug' => $achievement->slug,
                'description' => $achievement->description,
                'type' => $achievement->type,
                'threshold' => $achievement->threshold,
                'icon' => $achievement->icon,
                'color' => $achievement->color,
                'is_active' => $achievement->is_active,
                'sort_order' => $achievement->sort_order,
                'team' => $achievement->team,
                'album' => $achievement->album,
                'metadata' => $achievement->metadata,
                'users' => $achievement->userAchievements->map(fn (UserAchievement $item): array => [
                    'id' => $item->id,
                    'source' => $item->source,
                    'unlocked_at' => optional($item->unlocked_at)?->toDateTimeString(),
                    'user' => $item->user,
                    'album' => $item->album,
                ])->values()->all(),
            ],
            'users' => User::query()
                ->where('approval_status', User::APPROVAL_APPROVED)
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
            'auditLogs' => $auditLogs,
            'can' => [
                'update' => $request->user()?->can('update', $achievement) ?? false,
                'grant' => $request->user()?->can('grant', $achievement) ?? false,
            ],
        ]);
    }

    public function edit(Achievement $achievement): Response
    {
        $this->authorize('update', $achievement);

        return Inertia::render('admin/achievements/edit', [
            'achievement' => [
                'id' => $achievement->id,
                'team_id' => $achievement->team_id,
                'album_id' => $achievement->album_id,
                'name' => $achievement->name,
                'slug' => $achievement->slug,
                'description' => $achievement->description,
                'type' => $achievement->type,
                'threshold' => $achievement->threshold,
                'icon' => $achievement->icon,
                'color' => $achievement->color,
                'is_active' => $achievement->is_active,
                'sort_order' => $achievement->sort_order,
            ],
            'types' => Achievement::TYPES,
            'teams' => Team::query()->orderBy('name')->get(['id', 'name']),
            'albums' => Album::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateAchievementRequest $request, Achievement $achievement): RedirectResponse
    {
        $this->authorize('update', $achievement);

        $validated = $request->validated();

        if ($validated['type'] !== Achievement::TYPE_SPECIAL && ! isset($validated['threshold'])) {
            return back()->withErrors([
                'threshold' => 'Threshold é obrigatório para este tipo de conquista.',
            ])->withInput();
        }

        if ($validated['type'] === Achievement::TYPE_SPECIAL) {
            $validated['threshold'] = null;
        }

        $achievement->fill($validated)->save();

        $this->auditLogger->log(
            action: 'achievement.updated',
            actor: $request->user(),
            entityType: Achievement::class,
            entityId: $achievement->id,
            metadata: [
                'achievement_id' => $achievement->id,
                'slug' => $achievement->slug,
                'type' => $achievement->type,
                'threshold' => $achievement->threshold,
            ],
        );

        return redirect()->route('admin.achievements.show', $achievement)
            ->with('success', 'Conquista atualizada com sucesso.');
    }

    public function grant(GrantAchievementRequest $request, Achievement $achievement): RedirectResponse
    {
        $this->authorize('grant', $achievement);

        $target = User::query()->findOrFail((int) $request->validated('user_id'));

        if (! $target->isApproved()) {
            return back()->withErrors([
                'grant' => 'Somente usuários aprovados podem receber conquistas.',
            ]);
        }

        $albumId = $achievement->album_id;

        $exists = UserAchievement::query()
            ->where('user_id', $target->id)
            ->where('achievement_id', $achievement->id)
            ->where('album_id', $albumId)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'grant' => 'Este usuário já possui esta conquista.',
            ]);
        }

        $entry = UserAchievement::query()->create([
            'user_id' => $target->id,
            'achievement_id' => $achievement->id,
            'album_id' => $albumId,
            'unlocked_at' => now(),
            'source' => UserAchievement::SOURCE_ADMIN,
            'metadata' => [
                'note' => $request->validated('note'),
            ],
        ]);

        $this->auditLogger->log(
            action: 'achievement.granted',
            actor: $request->user(),
            target: $target,
            entityType: Achievement::class,
            entityId: $achievement->id,
            metadata: [
                'achievement_id' => $achievement->id,
                'user_achievement_id' => $entry->id,
                'target_user_id' => $target->id,
                'note' => $request->validated('note'),
            ],
        );

        $this->createShareCardService->createForUser(
            user: $target,
            type: 'achievement_unlocked',
            album: $achievement->album,
            title: 'Nova conquista desbloqueada',
            subtitle: $achievement->name,
            metric: $achievement->threshold,
            related: [
                'achievement_id' => $achievement->id,
                'user_achievement_id' => $entry->id,
            ],
        );

        return back()->with('success', 'Conquista concedida com sucesso.');
    }
}
