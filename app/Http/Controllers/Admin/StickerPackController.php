<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CancelStickerPackRequest;
use App\Http\Requests\StoreStickerPackRequest;
use App\Models\Album;
use App\Models\AuditLog;
use App\Models\StickerPack;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use App\Services\Stickers\RevokePackService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StickerPackController extends Controller
{
    public function __construct(
        private readonly AuditLogger $auditLogger,
        private readonly RevokePackService $revokePackService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', StickerPack::class);

        $filters = [
            'user_id' => $request->integer('user_id') ?: null,
            'album_id' => $request->integer('album_id') ?: null,
            'status' => $request->string('status')->toString(),
            'source' => $request->string('source')->toString(),
            'date_from' => $request->string('date_from')->toString(),
            'date_to' => $request->string('date_to')->toString(),
        ];

        $packs = StickerPack::query()
            ->with([
                'user:id,name,email',
                'album:id,name,slug',
                'activity:id,title,type,status',
                'rewardCode:id,code,title',
                'socialMission:id,title,slug',
                'grantedBy:id,name,email',
            ])
            ->when($filters['user_id'] !== null, fn ($query) => $query->where('user_id', $filters['user_id']))
            ->when($filters['album_id'] !== null, fn ($query) => $query->where('album_id', $filters['album_id']))
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['source'] !== '', fn ($query) => $query->where('source', $filters['source']))
            ->when($filters['date_from'] !== '', fn ($query) => $query->whereDate('created_at', '>=', $filters['date_from']))
            ->when($filters['date_to'] !== '', fn ($query) => $query->whereDate('created_at', '<=', $filters['date_to']))
            ->orderByDesc('id')
            ->paginate(30)
            ->withQueryString()
            ->through(fn (StickerPack $pack): array => [
                'id' => $pack->id,
                'status' => $pack->status,
                'size' => $pack->size,
                'source' => $pack->source,
                'created_at' => optional($pack->created_at)?->toDateTimeString(),
                'opened_at' => optional($pack->opened_at)?->toDateTimeString(),
                'cancelled_at' => optional($pack->cancelled_at)?->toDateTimeString(),
                'user' => $pack->user,
                'album' => $pack->album,
                'activity' => $pack->activity,
                'reward_code' => $pack->rewardCode,
                'social_mission' => $pack->socialMission,
                'granted_by_user' => $pack->grantedBy,
            ]);

        return Inertia::render('admin/sticker-packs/index', [
            'packs' => $packs,
            'filters' => $filters,
            'users' => User::query()->orderBy('name')->get(['id', 'name', 'email']),
            'albums' => Album::query()->orderBy('name')->get(['id', 'name']),
            'statuses' => StickerPack::STATUSES,
            'sources' => StickerPack::SOURCES,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', StickerPack::class);

        return Inertia::render('admin/sticker-packs/create', [
            'users' => User::query()
                ->where('approval_status', User::APPROVAL_APPROVED)
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
            'albums' => Album::query()->where('status', Album::STATUS_ACTIVE)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreStickerPackRequest $request): RedirectResponse
    {
        $this->authorize('create', StickerPack::class);

        $validated = $request->validated();

        $quantity = (int) $validated['quantity'];
        $size = (int) $validated['size'];
        $note = $validated['note'] ?? null;

        $packIds = [];

        for ($i = 0; $i < $quantity; $i++) {
            $pack = StickerPack::query()->create([
                'user_id' => (int) $validated['user_id'],
                'album_id' => (int) $validated['album_id'],
                'granted_by' => $request->user()?->id,
                'source' => StickerPack::SOURCE_ADMIN,
                'status' => StickerPack::STATUS_PENDING,
                'size' => $size,
                'metadata' => $note ? ['note' => $note] : null,
            ]);

            $packIds[] = $pack->id;
        }

        $targetUser = User::query()->find((int) $validated['user_id']);

        $this->auditLogger->log(
            action: 'sticker_pack.granted',
            actor: $request->user(),
            target: $targetUser,
            entityType: StickerPack::class,
            metadata: [
                'target_user_id' => (int) $validated['user_id'],
                'album_id' => (int) $validated['album_id'],
                'quantity' => $quantity,
                'size' => $size,
                'pack_ids' => $packIds,
            ],
        );

        return redirect()->route('admin.sticker-packs.index')
            ->with('success', 'Pacotes concedidos com sucesso.');
    }

    public function show(Request $request, StickerPack $stickerPack): Response
    {
        $this->authorize('view', $stickerPack);

        $stickerPack->load([
            'user:id,name,email',
            'album:id,name,slug',
            'activity:id,title,type,status',
            'rewardCode:id,code,title,status',
            'rewardCodeRedemption:id,reward_code_id,user_id,redeemed_at',
            'socialMission:id,title,slug,status',
            'socialMissionSubmission:id,social_mission_id,user_id,status,submitted_at',
            'grantedBy:id,name,email',
            'items.sticker:id,code,title,type,rarity',
        ]);

        $auditLogs = AuditLog::query()
            ->with(['actor:id,name,email', 'target:id,name,email'])
            ->where('entity_type', StickerPack::class)
            ->where('entity_id', $stickerPack->id)
            ->orderByDesc('created_at')
            ->limit(25)
            ->get()
            ->map(fn (AuditLog $log): array => [
                'id' => $log->id,
                'action' => $log->action,
                'metadata' => $log->metadata,
                'created_at' => optional($log->created_at)?->toDateTimeString(),
                'actor' => $log->actor ? [
                    'id' => $log->actor->id,
                    'name' => $log->actor->name,
                    'email' => $log->actor->email,
                ] : null,
                'target' => $log->target ? [
                    'id' => $log->target->id,
                    'name' => $log->target->name,
                    'email' => $log->target->email,
                ] : null,
            ])
            ->values();

        return Inertia::render('admin/sticker-packs/show', [
            'pack' => [
                'id' => $stickerPack->id,
                'status' => $stickerPack->status,
                'source' => $stickerPack->source,
                'size' => $stickerPack->size,
                'metadata' => $stickerPack->metadata,
                'opened_at' => optional($stickerPack->opened_at)?->toDateTimeString(),
                'cancelled_at' => optional($stickerPack->cancelled_at)?->toDateTimeString(),
                'cancellation_reason' => $stickerPack->cancellation_reason,
                'created_at' => optional($stickerPack->created_at)?->toDateTimeString(),
                'user' => $stickerPack->user,
                'album' => $stickerPack->album,
                'activity' => $stickerPack->activity,
                'activity_checkin_id' => $stickerPack->activity_checkin_id,
                'reward_code' => $stickerPack->rewardCode,
                'reward_code_redemption_id' => $stickerPack->reward_code_redemption_id,
                'social_mission' => $stickerPack->socialMission,
                'social_mission_submission_id' => $stickerPack->social_mission_submission_id,
                'granted_by_user' => $stickerPack->grantedBy,
                'items' => $stickerPack->items->map(fn ($item): array => [
                    'id' => $item->id,
                    'created_at' => optional($item->created_at)?->toDateTimeString(),
                    'sticker' => $item->sticker,
                ])->values()->all(),
            ],
            'auditLogs' => $auditLogs,
            'canCancel' => $request->user()?->can('cancel', $stickerPack) ?? false,
            'canRevoke' => $request->user()?->can('revoke', $stickerPack) ?? false,
        ]);
    }

    public function cancel(CancelStickerPackRequest $request, StickerPack $stickerPack): RedirectResponse
    {
        $this->authorize('cancel', $stickerPack);

        if ($stickerPack->status !== StickerPack::STATUS_PENDING) {
            return back()->withErrors([
                'pack' => 'Somente pacotes pendentes podem ser cancelados.',
            ]);
        }

        $stickerPack->forceFill([
            'status' => StickerPack::STATUS_CANCELLED,
            'cancelled_at' => now(),
            'cancellation_reason' => $request->validated('cancellation_reason'),
        ])->save();

        $this->auditLogger->log(
            action: 'sticker_pack.cancelled',
            actor: $request->user(),
            target: $stickerPack->user,
            entityType: StickerPack::class,
            entityId: $stickerPack->id,
            metadata: [
                'pack_id' => $stickerPack->id,
                'reason' => $stickerPack->cancellation_reason,
            ],
        );

        return back()->with('success', 'Pacote cancelado com sucesso.');
    }

    public function revoke(CancelStickerPackRequest $request, StickerPack $stickerPack): RedirectResponse
    {
        $this->authorize('revoke', $stickerPack);

        if ($stickerPack->status === StickerPack::STATUS_CANCELLED) {
            return back()->withErrors(['pack' => 'O pacote já está cancelado.']);
        }

        $this->revokePackService->revoke(
            pack: $stickerPack,
            actor: $request->user(),
            reason: $request->validated('cancellation_reason'),
        );

        return back()->with('success', 'Pacote revogado e figurinhas removidas do álbum do usuário.');
    }
}
