<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeamRequest;
use App\Http\Requests\UpdateTeamRequest;
use App\Models\Team;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Team::class);

        $filters = [
            'search' => $request->string('search')->toString(),
            'is_active' => $request->string('is_active')->toString(),
        ];

        $teams = Team::query()
            ->when($filters['search'] !== '', function ($query) use ($filters) {
                $search = $filters['search'];

                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('short_name', 'like', "%{$search}%");
                });
            })
            ->when($filters['is_active'] !== '', fn ($query) => $query->where('is_active', $filters['is_active'] === '1'))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Team $team): array => [
                'id' => $team->id,
                'name' => $team->name,
                'slug' => $team->slug,
                'short_name' => $team->short_name,
                'is_active' => $team->is_active,
                'created_at' => optional($team->created_at)?->toDateTimeString(),
            ]);

        return Inertia::render('admin/teams/index', [
            'teams' => $teams,
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Team::class);

        return Inertia::render('admin/teams/create');
    }

    public function store(StoreTeamRequest $request): RedirectResponse
    {
        $this->authorize('create', Team::class);

        $team = Team::query()->create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        $this->auditLogger->log(
            action: 'team.created',
            actor: $request->user(),
            entityType: Team::class,
            entityId: $team->id,
            metadata: [
                'team_id' => $team->id,
                'slug' => $team->slug,
            ],
        );

        return redirect()->route('admin.teams.show', $team)->with('success', 'Time criado com sucesso.');
    }

    public function show(Team $team): Response
    {
        $this->authorize('view', $team);

        $team->loadCount(['albums', 'players']);

        return Inertia::render('admin/teams/show', [
            'team' => [
                'id' => $team->id,
                'name' => $team->name,
                'slug' => $team->slug,
                'short_name' => $team->short_name,
                'description' => $team->description,
                'logo_path' => $team->logo_path,
                'primary_color' => $team->primary_color,
                'secondary_color' => $team->secondary_color,
                'is_active' => $team->is_active,
                'albums_count' => $team->albums_count,
                'players_count' => $team->players_count,
                'created_at' => optional($team->created_at)?->toDateTimeString(),
                'updated_at' => optional($team->updated_at)?->toDateTimeString(),
            ],
        ]);
    }

    public function edit(Team $team): Response
    {
        $this->authorize('update', $team);

        return Inertia::render('admin/teams/edit', [
            'team' => [
                'id' => $team->id,
                'name' => $team->name,
                'slug' => $team->slug,
                'short_name' => $team->short_name,
                'description' => $team->description,
                'logo_path' => $team->logo_path,
                'primary_color' => $team->primary_color,
                'secondary_color' => $team->secondary_color,
                'is_active' => $team->is_active,
            ],
        ]);
    }

    public function update(UpdateTeamRequest $request, Team $team): RedirectResponse
    {
        $this->authorize('update', $team);

        $team->fill([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active'),
        ])->save();

        $this->auditLogger->log(
            action: 'team.updated',
            actor: $request->user(),
            entityType: Team::class,
            entityId: $team->id,
            metadata: [
                'team_id' => $team->id,
                'slug' => $team->slug,
            ],
        );

        return redirect()->route('admin.teams.show', $team)->with('success', 'Time atualizado com sucesso.');
    }
}
