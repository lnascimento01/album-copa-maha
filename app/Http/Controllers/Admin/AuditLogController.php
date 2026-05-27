<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', AuditLog::class);

        $filters = [
            'actor_id' => $request->integer('actor_id') ?: null,
            'target_id' => $request->integer('target_id') ?: null,
            'action' => $request->string('action')->toString(),
            'date' => $request->string('date')->toString(),
        ];

        $logs = AuditLog::query()
            ->with(['actor:id,name,email', 'target:id,name,email'])
            ->when($filters['actor_id'] !== null, fn ($query) => $query->where('actor_user_id', $filters['actor_id']))
            ->when($filters['target_id'] !== null, fn ($query) => $query->where('target_user_id', $filters['target_id']))
            ->when($filters['action'] !== '', fn ($query) => $query->where('action', $filters['action']))
            ->when($filters['date'] !== '', fn ($query) => $query->whereDate('created_at', $filters['date']))
            ->orderByDesc('created_at')
            ->paginate(30)
            ->withQueryString()
            ->through(fn (AuditLog $log): array => [
                'id' => $log->id,
                'action' => $log->action,
                'entity_type' => $log->entity_type,
                'entity_id' => $log->entity_id,
                'metadata' => $log->metadata,
                'ip_address' => $log->ip_address,
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
            ]);

        return Inertia::render('admin/audit-logs/index', [
            'auditLogs' => $logs,
            'filters' => $filters,
            'actors' => User::query()->orderBy('name')->get(['id', 'name', 'email']),
            'targets' => User::query()->orderBy('name')->get(['id', 'name', 'email']),
            'actions' => AuditLog::query()->select('action')->distinct()->orderBy('action')->pluck('action'),
        ]);
    }
}
