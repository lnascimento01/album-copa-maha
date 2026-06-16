<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePlayerRequest;
use App\Http\Requests\UpdatePlayerRequest;
use App\Models\Player;
use App\Models\Team;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PlayerController extends Controller
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Player::class);

        $filters = [
            'search' => $request->string('search')->toString(),
            'team_id' => $request->integer('team_id') ?: null,
            'type' => $request->string('type')->toString(),
            'is_active' => $request->string('is_active')->toString(),
        ];

        $players = Player::query()
            ->with(['team:id,name,slug'])
            ->when($filters['search'] !== '', function ($query) use ($filters) {
                $search = $filters['search'];

                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('nickname', 'like', "%{$search}%");
                });
            })
            ->when($filters['team_id'] !== null, fn ($query) => $query->where('team_id', $filters['team_id']))
            ->when($filters['type'] !== '', fn ($query) => $query->where('type', $filters['type']))
            ->when($filters['is_active'] !== '', fn ($query) => $query->where('is_active', $filters['is_active'] === '1'))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Player $player): array => [
                'id' => $player->id,
                'name' => $player->name,
                'nickname' => $player->nickname,
                'shirt_number' => $player->shirt_number,
                'position' => $player->position,
                'type' => $player->type,
                'is_active' => $player->is_active,
                'team' => $player->team,
            ]);

        return Inertia::render('admin/players/index', [
            'players' => $players,
            'filters' => $filters,
            'teams' => Team::query()->orderBy('name')->get(['id', 'name']),
            'types' => Player::TYPES,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Player::class);

        return Inertia::render('admin/players/create', [
            'teams' => Team::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'types' => Player::TYPES,
        ]);
    }

    public function store(StorePlayerRequest $request): RedirectResponse
    {
        $this->authorize('create', Player::class);

        $data = $request->validated();

        if ($request->hasFile('photo_upload')) {
            $storedPath = $request->file('photo_upload')->store('players', 'public');
            $data['photo_path'] = Storage::disk('public')->url($storedPath);
        }

        unset($data['photo_upload']);

        $player = Player::query()->create([
            ...$data,
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $request->integer('sort_order', 0),
        ]);

        $this->auditLogger->log(
            action: 'player.created',
            actor: $request->user(),
            entityType: Player::class,
            entityId: $player->id,
            metadata: [
                'player_id' => $player->id,
                'team_id' => $player->team_id,
                'type' => $player->type,
            ],
        );

        return redirect()->route('admin.players.show', $player)->with('success', 'Jogador/personagem criado com sucesso.');
    }

    public function show(Player $player): Response
    {
        $this->authorize('view', $player);

        $player->load(['team:id,name,slug']);

        return Inertia::render('admin/players/show', [
            'player' => [
                'id' => $player->id,
                'team_id' => $player->team_id,
                'name' => $player->name,
                'nickname' => $player->nickname,
                'shirt_number' => $player->shirt_number,
                'position' => $player->position,
                'type' => $player->type,
                'bio' => $player->bio,
                'photo_path' => $player->photo_path,
                'is_active' => $player->is_active,
                'sort_order' => $player->sort_order,
                'team' => $player->team,
                'created_at' => optional($player->created_at)?->toDateTimeString(),
                'updated_at' => optional($player->updated_at)?->toDateTimeString(),
            ],
        ]);
    }

    public function edit(Player $player): Response
    {
        $this->authorize('update', $player);

        return Inertia::render('admin/players/edit', [
            'player' => [
                'id' => $player->id,
                'team_id' => $player->team_id,
                'name' => $player->name,
                'nickname' => $player->nickname,
                'shirt_number' => $player->shirt_number,
                'position' => $player->position,
                'type' => $player->type,
                'bio' => $player->bio,
                'photo_path' => $player->photo_path,
                'is_active' => $player->is_active,
                'sort_order' => $player->sort_order,
            ],
            'teams' => Team::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'types' => Player::TYPES,
        ]);
    }

    public function update(UpdatePlayerRequest $request, Player $player): RedirectResponse
    {
        $this->authorize('update', $player);

        $data = $request->validated();

        if ($request->hasFile('photo_upload')) {
            $storedPath = $request->file('photo_upload')->store('players', 'public');
            $data['photo_path'] = Storage::disk('public')->url($storedPath);
        }

        unset($data['photo_upload']);

        $player->fill([
            ...$data,
            'is_active' => $request->boolean('is_active'),
            'sort_order' => $request->integer('sort_order', 0),
        ])->save();

        $this->auditLogger->log(
            action: 'player.updated',
            actor: $request->user(),
            entityType: Player::class,
            entityId: $player->id,
            metadata: [
                'player_id' => $player->id,
                'team_id' => $player->team_id,
                'type' => $player->type,
            ],
        );

        return redirect()->route('admin.players.show', $player)->with('success', 'Jogador/personagem atualizado com sucesso.');
    }
}
