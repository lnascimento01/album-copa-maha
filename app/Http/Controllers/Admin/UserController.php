<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $filters = [
            'status' => $request->string('status')->toString(),
            'search' => $request->string('search')->toString(),
        ];

        $users = User::query()
            ->with('roles:id,name,slug')
            ->when($filters['status'] !== '', fn ($query) => $query->where('approval_status', $filters['status']))
            ->when($filters['search'] !== '', function ($query) use ($filters) {
                $search = $filters['search'];
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'approval_status' => $user->approval_status,
                'roles' => $user->roles->map(fn ($role): array => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                ])->values()->all(),
                'created_at' => optional($user->created_at)?->toDateTimeString(),
            ]);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $filters,
        ]);
    }

    public function show(Request $request, User $user): Response
    {
        $this->authorize('view', $user);

        $user->load('roles:id,name,slug');

        $logs = AuditLog::query()
            ->with(['actor:id,name,email', 'target:id,name,email'])
            ->where('actor_user_id', $user->id)
            ->orWhere('target_user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn (AuditLog $log): array => [
                'id' => $log->id,
                'action' => $log->action,
                'entity_type' => $log->entity_type,
                'entity_id' => $log->entity_id,
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

        return Inertia::render('admin/users/show', [
            'userDetail' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'approval_status' => $user->approval_status,
                'approved_at' => optional($user->approved_at)?->toDateTimeString(),
                'approved_by' => $user->approved_by,
                'rejected_at' => optional($user->rejected_at)?->toDateTimeString(),
                'rejected_by' => $user->rejected_by,
                'rejection_reason' => $user->rejection_reason,
                'roles' => $user->roles->map(fn ($role): array => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                ])->values()->all(),
                'permissions' => $user->permissions()->map(fn ($permission): array => [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'slug' => $permission->slug,
                    'group' => $permission->group,
                ])->values()->all(),
            ],
            'auditLogs' => $logs,
            'canApprove' => $request->user()?->can('approve', $user) ?? false,
            'canReject' => $request->user()?->can('reject', $user) ?? false,
            'canSuspend' => $request->user()?->can('suspend', $user) ?? false,
            'canResetStickers' => $request->user()?->can('resetStickers', $user) ?? false,
        ]);
    }
}
