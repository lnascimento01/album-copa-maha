<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAlbumRequest;
use App\Http\Requests\UpdateAlbumRequest;
use App\Models\Album;
use App\Models\Team;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AlbumController extends Controller
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Album::class);

        $filters = [
            'search' => $request->string('search')->toString(),
            'team_id' => $request->integer('team_id') ?: null,
            'status' => $request->string('status')->toString(),
        ];

        $albums = Album::query()
            ->with(['teams:id,name,slug'])
            ->withCount(['stickers'])
            ->when($filters['search'] !== '', function ($query) use ($filters) {
                $search = $filters['search'];
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('season', 'like', "%{$search}%");
                });
            })
            ->when($filters['team_id'] !== null, function ($query) use ($filters) {
                $query->where(function ($inner) use ($filters): void {
                    $inner->where('team_id', $filters['team_id'])
                        ->orWhereHas('teams', fn ($teamQuery) => $teamQuery->where('teams.id', $filters['team_id']));
                });
            })
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Album $album): array => [
                'id' => $album->id,
                'name' => $album->name,
                'slug' => $album->slug,
                'season' => $album->season,
                'status' => $album->status,
                'published_at' => optional($album->published_at)?->toDateTimeString(),
                'stickers_count' => $album->stickers_count,
                'team' => $album->teams->first() ?? ($album->team ? [
                    'id' => $album->team->id,
                    'name' => $album->team->name,
                    'slug' => $album->team->slug,
                ] : null),
                'teams' => $album->teams->map(fn (Team $team): array => [
                    'id' => $team->id,
                    'name' => $team->name,
                    'slug' => $team->slug,
                ])->values()->all(),
            ]);

        return Inertia::render('admin/albums/index', [
            'albums' => $albums,
            'filters' => $filters,
            'teams' => Team::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'statuses' => Album::STATUSES,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Album::class);

        return Inertia::render('admin/albums/create', [
            'teams' => Team::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreAlbumRequest $request): RedirectResponse
    {
        $this->authorize('create', Album::class);

        $validated = $request->validated();
        $teamIds = $validated['team_ids'];

        $album = Album::query()->create([
            ...collect($validated)->except('team_ids')->all(),
            'team_id' => $teamIds[0],
            'status' => Album::STATUS_DRAFT,
            'created_by' => $request->user()?->id,
            'updated_by' => $request->user()?->id,
            'published_at' => null,
        ]);
        $album->teams()->sync($teamIds);

        $this->auditLogger->log(
            action: 'album.created',
            actor: $request->user(),
            entityType: Album::class,
            entityId: $album->id,
            metadata: [
                'album_id' => $album->id,
                'team_id' => $album->team_id,
                'team_ids' => $teamIds,
                'status' => $album->status,
            ],
        );

        return redirect()->route('admin.albums.show', $album)->with('success', 'Álbum criado com sucesso.');
    }

    public function show(Album $album): Response
    {
        $this->authorize('view', $album);

        $album->load(['team:id,name,slug', 'teams:id,name,slug', 'creator:id,name,email', 'updater:id,name,email'])
            ->loadCount(['stickers']);

        return Inertia::render('admin/albums/show', [
            'album' => [
                'id' => $album->id,
                'team_id' => $album->team_id,
                'team_ids' => $album->teams->pluck('id')->whenEmpty(fn ($collection) => $album->team_id ? $collection->push($album->team_id) : $collection)->values()->all(),
                'name' => $album->name,
                'slug' => $album->slug,
                'season' => $album->season,
                'description' => $album->description,
                'cover_image_path' => $album->cover_image_path,
                'status' => $album->status,
                'starts_at' => optional($album->starts_at)?->toDateTimeString(),
                'ends_at' => optional($album->ends_at)?->toDateTimeString(),
                'published_at' => optional($album->published_at)?->toDateTimeString(),
                'stickers_count' => $album->stickers_count,
                'team' => $album->team,
                'teams' => $album->teams,
                'creator' => $album->creator,
                'updater' => $album->updater,
                'created_at' => optional($album->created_at)?->toDateTimeString(),
                'updated_at' => optional($album->updated_at)?->toDateTimeString(),
            ],
        ]);
    }

    public function edit(Album $album): Response
    {
        $this->authorize('update', $album);

        return Inertia::render('admin/albums/edit', [
            'album' => [
                'id' => $album->id,
                'team_id' => $album->team_id,
                'team_ids' => $album->teams()->pluck('teams.id')->whenEmpty(fn ($collection) => $album->team_id ? $collection->push($album->team_id) : $collection)->values()->all(),
                'name' => $album->name,
                'slug' => $album->slug,
                'season' => $album->season,
                'description' => $album->description,
                'cover_image_path' => $album->cover_image_path,
                'starts_at' => optional($album->starts_at)?->format('Y-m-d\\TH:i'),
                'ends_at' => optional($album->ends_at)?->format('Y-m-d\\TH:i'),
                'status' => $album->status,
            ],
            'teams' => Team::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateAlbumRequest $request, Album $album): RedirectResponse
    {
        $this->authorize('update', $album);

        if ($album->status === Album::STATUS_ARCHIVED) {
            return back()->withErrors([
                'album' => 'Álbuns arquivados não podem ser editados nesta etapa.',
            ]);
        }

        $validated = $request->validated();
        $teamIds = $validated['team_ids'];

        $album->fill([
            ...collect($validated)->except('team_ids')->all(),
            'team_id' => $teamIds[0],
            'updated_by' => $request->user()?->id,
        ])->save();
        $album->teams()->sync($teamIds);

        $this->auditLogger->log(
            action: 'album.updated',
            actor: $request->user(),
            entityType: Album::class,
            entityId: $album->id,
            metadata: [
                'album_id' => $album->id,
                'team_id' => $album->team_id,
                'team_ids' => $teamIds,
                'status' => $album->status,
            ],
        );

        return redirect()->route('admin.albums.show', $album)->with('success', 'Álbum atualizado com sucesso.');
    }

    public function publish(Request $request, Album $album): RedirectResponse
    {
        $this->authorize('publish', $album);

        if ($album->status === Album::STATUS_ARCHIVED) {
            return back()->withErrors([
                'album' => 'Álbum arquivado não pode ser publicado diretamente.',
            ]);
        }

        if ($album->status !== Album::STATUS_DRAFT) {
            return back()->withErrors([
                'album' => 'Somente álbuns em rascunho podem ser publicados.',
            ]);
        }

        $teamIds = $album->teams()->pluck('teams.id')->values();

        if ($teamIds->isEmpty() && $album->team_id !== null) {
            $teamIds = collect([$album->team_id]);
        }

        $hasAnotherActive = Album::query()
            ->where('status', Album::STATUS_ACTIVE)
            ->where('id', '!=', $album->id)
            ->where(function ($query) use ($teamIds): void {
                $query->whereIn('team_id', $teamIds->all())
                    ->orWhereHas('teams', fn ($teamQuery) => $teamQuery->whereIn('teams.id', $teamIds->all()));
            })
            ->exists();

        if ($hasAnotherActive) {
            return back()->withErrors([
                'album' => 'Já existe um álbum ativo para uma das equipes vinculadas. Arquive o álbum ativo antes de publicar outro.',
            ]);
        }

        $album->forceFill([
            'status' => Album::STATUS_ACTIVE,
            'published_at' => now(),
            'updated_by' => $request->user()?->id,
        ])->save();

        $this->auditLogger->log(
            action: 'album.published',
            actor: $request->user(),
            entityType: Album::class,
            entityId: $album->id,
            metadata: [
                'album_id' => $album->id,
                'team_id' => $album->team_id,
                'team_ids' => $teamIds->all(),
            ],
        );

        return back()->with('success', 'Álbum publicado com sucesso.');
    }

    public function archive(Request $request, Album $album): RedirectResponse
    {
        $this->authorize('archive', $album);

        if ($album->status !== Album::STATUS_ACTIVE) {
            return back()->withErrors([
                'album' => 'Somente álbuns ativos podem ser arquivados.',
            ]);
        }

        $album->forceFill([
            'status' => Album::STATUS_ARCHIVED,
            'updated_by' => $request->user()?->id,
        ])->save();

        $this->auditLogger->log(
            action: 'album.archived',
            actor: $request->user(),
            entityType: Album::class,
            entityId: $album->id,
            metadata: [
                'album_id' => $album->id,
                'team_id' => $album->team_id,
                'team_ids' => $album->teams()->pluck('teams.id')->values()->all(),
            ],
        );

        return back()->with('success', 'Álbum arquivado com sucesso.');
    }
}
