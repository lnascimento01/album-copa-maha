<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStickerRequest;
use App\Http\Requests\UpdateStickerRequest;
use App\Models\Album;
use App\Models\Player;
use App\Models\Sticker;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StickerController extends Controller
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Sticker::class);

        $filters = [
            'search' => $request->string('search')->toString(),
            'album_id' => $request->integer('album_id') ?: null,
            'type' => $request->string('type')->toString(),
            'rarity' => $request->string('rarity')->toString(),
            'is_active' => $request->string('is_active')->toString(),
        ];

        $stickers = Sticker::query()
            ->with(['album:id,name,slug', 'player:id,name'])
            ->when($filters['search'] !== '', function ($query) use ($filters) {
                $search = $filters['search'];

                $query->where(function ($inner) use ($search) {
                    $inner->where('title', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->when($filters['album_id'] !== null, fn ($query) => $query->where('album_id', $filters['album_id']))
            ->when($filters['type'] !== '', fn ($query) => $query->where('type', $filters['type']))
            ->when($filters['rarity'] !== '', fn ($query) => $query->where('rarity', $filters['rarity']))
            ->when($filters['is_active'] !== '', fn ($query) => $query->where('is_active', $filters['is_active'] === '1'))
            ->orderBy('sort_order')
            ->orderBy('code')
            ->paginate(30)
            ->withQueryString()
            ->through(fn (Sticker $sticker): array => [
                'id' => $sticker->id,
                'code' => $sticker->code,
                'title' => $sticker->title,
                'type' => $sticker->type,
                'rarity' => $sticker->rarity,
                'is_active' => $sticker->is_active,
                'album' => $sticker->album,
                'player' => $sticker->player,
            ]);

        return Inertia::render('admin/stickers/index', [
            'stickers' => $stickers,
            'filters' => $filters,
            'albums' => Album::query()->orderBy('name')->get(['id', 'name']),
            'types' => Sticker::TYPES,
            'rarities' => Sticker::RARITIES,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Sticker::class);

        $albums = Album::query()
            ->with('teams:id')
            ->orderBy('name')
            ->get()
            ->map(fn (Album $album): array => [
                'id' => $album->id,
                'name' => $album->name,
                'team_id' => $album->team_id,
                'team_ids' => $album->teams->pluck('id')->whenEmpty(fn ($collection) => $album->team_id ? $collection->push($album->team_id) : $collection)->values()->all(),
            ])
            ->values()
            ->all();

        return Inertia::render('admin/stickers/create', [
            'albums' => $albums,
            'players' => Player::query()->orderBy('name')->get(['id', 'name', 'team_id']),
            'types' => Sticker::TYPES,
            'rarities' => Sticker::RARITIES,
        ]);
    }

    public function store(StoreStickerRequest $request): RedirectResponse
    {
        $this->authorize('create', Sticker::class);

        $sticker = Sticker::query()->create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $request->integer('sort_order', 0),
        ]);

        $this->auditLogger->log(
            action: 'sticker.created',
            actor: $request->user(),
            entityType: Sticker::class,
            entityId: $sticker->id,
            metadata: [
                'sticker_id' => $sticker->id,
                'album_id' => $sticker->album_id,
                'code' => $sticker->code,
            ],
        );

        return redirect()->route('admin.stickers.show', $sticker)->with('success', 'Figurinha criada com sucesso.');
    }

    public function show(Sticker $sticker): Response
    {
        $this->authorize('view', $sticker);

        $sticker->load(['album:id,name,slug', 'player:id,name']);

        return Inertia::render('admin/stickers/show', [
            'sticker' => [
                'id' => $sticker->id,
                'album_id' => $sticker->album_id,
                'player_id' => $sticker->player_id,
                'code' => $sticker->code,
                'title' => $sticker->title,
                'subtitle' => $sticker->subtitle,
                'description' => $sticker->description,
                'type' => $sticker->type,
                'rarity' => $sticker->rarity,
                'image_path' => $sticker->image_path,
                'sort_order' => $sticker->sort_order,
                'is_active' => $sticker->is_active,
                'metadata' => $sticker->metadata,
                'album' => $sticker->album,
                'player' => $sticker->player,
                'created_at' => optional($sticker->created_at)?->toDateTimeString(),
                'updated_at' => optional($sticker->updated_at)?->toDateTimeString(),
            ],
        ]);
    }

    public function edit(Sticker $sticker): Response
    {
        $this->authorize('update', $sticker);

        $albums = Album::query()
            ->with('teams:id')
            ->orderBy('name')
            ->get()
            ->map(fn (Album $album): array => [
                'id' => $album->id,
                'name' => $album->name,
                'team_id' => $album->team_id,
                'team_ids' => $album->teams->pluck('id')->whenEmpty(fn ($collection) => $album->team_id ? $collection->push($album->team_id) : $collection)->values()->all(),
            ])
            ->values()
            ->all();

        return Inertia::render('admin/stickers/edit', [
            'sticker' => [
                'id' => $sticker->id,
                'album_id' => $sticker->album_id,
                'player_id' => $sticker->player_id,
                'code' => $sticker->code,
                'title' => $sticker->title,
                'subtitle' => $sticker->subtitle,
                'description' => $sticker->description,
                'type' => $sticker->type,
                'rarity' => $sticker->rarity,
                'image_path' => $sticker->image_path,
                'sort_order' => $sticker->sort_order,
                'is_active' => $sticker->is_active,
            ],
            'albums' => $albums,
            'players' => Player::query()->orderBy('name')->get(['id', 'name', 'team_id']),
            'types' => Sticker::TYPES,
            'rarities' => Sticker::RARITIES,
        ]);
    }

    public function update(UpdateStickerRequest $request, Sticker $sticker): RedirectResponse
    {
        $this->authorize('update', $sticker);

        $sticker->fill([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active'),
            'sort_order' => $request->integer('sort_order', 0),
        ])->save();

        $this->auditLogger->log(
            action: 'sticker.updated',
            actor: $request->user(),
            entityType: Sticker::class,
            entityId: $sticker->id,
            metadata: [
                'sticker_id' => $sticker->id,
                'album_id' => $sticker->album_id,
                'code' => $sticker->code,
            ],
        );

        return redirect()->route('admin.stickers.show', $sticker)->with('success', 'Figurinha atualizada com sucesso.');
    }
}
