<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RevokeRewardCodeRequest;
use App\Http\Requests\StoreRewardCodeRequest;
use App\Http\Requests\UpdateRewardCodeRequest;
use App\Models\Album;
use App\Models\AuditLog;
use App\Models\RewardCode;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RewardCodeController extends Controller
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', RewardCode::class);

        $filters = [
            'search' => $request->string('search')->toString(),
            'status' => $request->string('status')->toString(),
            'source_channel' => $request->string('source_channel')->toString(),
            'album_id' => $request->integer('album_id') ?: null,
        ];

        $codes = RewardCode::query()
            ->with(['album:id,name,slug'])
            ->when($filters['search'] !== '', function ($query) use ($filters) {
                $search = $filters['search'];

                $query->where(function ($inner) use ($search) {
                    $inner->where('code', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%");
                });
            })
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['source_channel'] !== '', fn ($query) => $query->where('source_channel', $filters['source_channel']))
            ->when($filters['album_id'] !== null, fn ($query) => $query->where('album_id', $filters['album_id']))
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (RewardCode $code): array => [
                'id' => $code->id,
                'code' => $code->code,
                'title' => $code->title,
                'status' => $code->status,
                'source_channel' => $code->source_channel,
                'reward_pack_quantity' => $code->reward_pack_quantity,
                'reward_pack_size' => $code->reward_pack_size,
                'starts_at' => optional($code->starts_at)?->toDateTimeString(),
                'expires_at' => optional($code->expires_at)?->toDateTimeString(),
                'redeemed_count' => $code->redeemed_count,
                'max_total_redemptions' => $code->max_total_redemptions,
                'album' => $code->album,
            ]);

        return Inertia::render('admin/reward-codes/index', [
            'rewardCodes' => $codes,
            'filters' => $filters,
            'statuses' => RewardCode::STATUSES,
            'channels' => RewardCode::CHANNELS,
            'albums' => Album::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', RewardCode::class);

        return Inertia::render('admin/reward-codes/create', [
            'albums' => Album::query()->where('status', Album::STATUS_ACTIVE)->orderBy('name')->get(['id', 'name', 'team_id']),
            'statuses' => RewardCode::STATUSES,
            'channels' => RewardCode::CHANNELS,
        ]);
    }

    public function store(StoreRewardCodeRequest $request): RedirectResponse
    {
        $this->authorize('create', RewardCode::class);

        $validated = $request->validated();
        $album = Album::query()->findOrFail((int) $validated['album_id']);

        $rewardCode = RewardCode::query()->create([
            ...$validated,
            'team_id' => (int) ($validated['team_id'] ?? $album->team_id),
            'status' => RewardCode::STATUS_DRAFT,
            'created_by' => $request->user()?->id,
            'redeemed_count' => 0,
        ]);

        $this->auditLogger->log(
            action: 'reward_code.created',
            actor: $request->user(),
            entityType: RewardCode::class,
            entityId: $rewardCode->id,
            metadata: [
                'reward_code_id' => $rewardCode->id,
                'code' => $rewardCode->code,
                'album_id' => $rewardCode->album_id,
            ],
        );

        return redirect()->route('admin.reward-codes.show', $rewardCode)
            ->with('success', 'Código promocional criado com sucesso.');
    }

    public function show(RewardCode $rewardCode): Response
    {
        $this->authorize('view', $rewardCode);

        $rewardCode->load([
            'album:id,name,slug,status',
            'creator:id,name,email',
            'revokedBy:id,name,email',
            'redemptions' => fn ($query) => $query->with(['user:id,name,email'])->orderByDesc('id')->limit(50),
            'stickerPacks' => fn ($query) => $query->with(['user:id,name,email'])->orderByDesc('id')->limit(100),
        ]);

        $auditLogs = AuditLog::query()
            ->with(['actor:id,name,email', 'target:id,name,email'])
            ->where('entity_type', RewardCode::class)
            ->where('entity_id', $rewardCode->id)
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

        return Inertia::render('admin/reward-codes/show', [
            'rewardCode' => [
                'id' => $rewardCode->id,
                'code' => $rewardCode->code,
                'title' => $rewardCode->title,
                'description' => $rewardCode->description,
                'status' => $rewardCode->status,
                'source_channel' => $rewardCode->source_channel,
                'reward_pack_quantity' => $rewardCode->reward_pack_quantity,
                'reward_pack_size' => $rewardCode->reward_pack_size,
                'starts_at' => optional($rewardCode->starts_at)?->toDateTimeString(),
                'expires_at' => optional($rewardCode->expires_at)?->toDateTimeString(),
                'max_total_redemptions' => $rewardCode->max_total_redemptions,
                'max_redemptions_per_user' => $rewardCode->max_redemptions_per_user,
                'redeemed_count' => $rewardCode->redeemed_count,
                'revoked_at' => optional($rewardCode->revoked_at)?->toDateTimeString(),
                'revoke_reason' => $rewardCode->revoke_reason,
                'album' => $rewardCode->album,
                'creator' => $rewardCode->creator,
                'revoked_by' => $rewardCode->revokedBy,
                'redemptions' => $rewardCode->redemptions->map(fn ($redemption): array => [
                    'id' => $redemption->id,
                    'redeemed_at' => optional($redemption->redeemed_at)?->toDateTimeString(),
                    'user' => $redemption->user,
                ])->values()->all(),
                'sticker_packs' => $rewardCode->stickerPacks->map(fn ($pack): array => [
                    'id' => $pack->id,
                    'status' => $pack->status,
                    'created_at' => optional($pack->created_at)?->toDateTimeString(),
                    'user' => $pack->user,
                ])->values()->all(),
            ],
            'shareText' => sprintf(
                'Use o código %s no Álbum da Copa AAPH e desbloqueie %d pacote(s). Válido até %s.',
                $rewardCode->code,
                $rewardCode->reward_pack_quantity,
                $rewardCode->expires_at?->format('d/m/Y H:i') ?? 'prazo indefinido',
            ),
            'auditLogs' => $auditLogs,
        ]);
    }

    public function edit(RewardCode $rewardCode): Response
    {
        $this->authorize('update', $rewardCode);

        return Inertia::render('admin/reward-codes/edit', [
            'rewardCode' => [
                'id' => $rewardCode->id,
                'album_id' => $rewardCode->album_id,
                'code' => $rewardCode->code,
                'title' => $rewardCode->title,
                'description' => $rewardCode->description,
                'status' => $rewardCode->status,
                'source_channel' => $rewardCode->source_channel,
                'reward_pack_quantity' => $rewardCode->reward_pack_quantity,
                'reward_pack_size' => $rewardCode->reward_pack_size,
                'starts_at' => optional($rewardCode->starts_at)?->format('Y-m-d\\TH:i'),
                'expires_at' => optional($rewardCode->expires_at)?->format('Y-m-d\\TH:i'),
                'max_total_redemptions' => $rewardCode->max_total_redemptions,
                'max_redemptions_per_user' => $rewardCode->max_redemptions_per_user,
            ],
            'albums' => Album::query()->orderBy('name')->get(['id', 'name', 'team_id']),
            'statuses' => RewardCode::STATUSES,
            'channels' => RewardCode::CHANNELS,
        ]);
    }

    public function update(UpdateRewardCodeRequest $request, RewardCode $rewardCode): RedirectResponse
    {
        $this->authorize('update', $rewardCode);

        $validated = $request->validated();
        $album = Album::query()->findOrFail((int) $validated['album_id']);

        $rewardCode->fill([
            ...$validated,
            'team_id' => (int) ($validated['team_id'] ?? $album->team_id),
        ])->save();

        $this->auditLogger->log(
            action: 'reward_code.updated',
            actor: $request->user(),
            entityType: RewardCode::class,
            entityId: $rewardCode->id,
            metadata: [
                'reward_code_id' => $rewardCode->id,
                'code' => $rewardCode->code,
            ],
        );

        return redirect()->route('admin.reward-codes.show', $rewardCode)
            ->with('success', 'Código promocional atualizado com sucesso.');
    }

    public function activate(Request $request, RewardCode $rewardCode): RedirectResponse
    {
        $this->authorize('activate', $rewardCode);

        if (! in_array($rewardCode->status, [RewardCode::STATUS_DRAFT, RewardCode::STATUS_EXPIRED], true)) {
            return back()->withErrors(['reward_code' => 'Somente códigos draft ou expired podem ser ativados.']);
        }

        if ($rewardCode->album->status !== Album::STATUS_ACTIVE) {
            return back()->withErrors(['reward_code' => 'Não é possível ativar código em álbum não ativo.']);
        }

        $rewardCode->forceFill([
            'status' => RewardCode::STATUS_ACTIVE,
            'revoked_by' => null,
            'revoked_at' => null,
            'revoke_reason' => null,
        ])->save();

        $this->auditLogger->log(
            action: 'reward_code.activated',
            actor: $request->user(),
            entityType: RewardCode::class,
            entityId: $rewardCode->id,
            metadata: [
                'reward_code_id' => $rewardCode->id,
                'code' => $rewardCode->code,
            ],
        );

        return back()->with('success', 'Código ativado com sucesso.');
    }

    public function revoke(RevokeRewardCodeRequest $request, RewardCode $rewardCode): RedirectResponse
    {
        $this->authorize('revoke', $rewardCode);

        if ($rewardCode->status === RewardCode::STATUS_REVOKED) {
            return back()->withErrors(['reward_code' => 'Este código já está revogado.']);
        }

        $rewardCode->forceFill([
            'status' => RewardCode::STATUS_REVOKED,
            'revoked_by' => $request->user()?->id,
            'revoked_at' => now(),
            'revoke_reason' => $request->validated('revoke_reason'),
        ])->save();

        $this->auditLogger->log(
            action: 'reward_code.revoked',
            actor: $request->user(),
            entityType: RewardCode::class,
            entityId: $rewardCode->id,
            metadata: [
                'reward_code_id' => $rewardCode->id,
                'code' => $rewardCode->code,
                'reason' => $rewardCode->revoke_reason,
            ],
        );

        return back()->with('success', 'Código revogado com sucesso.');
    }
}
