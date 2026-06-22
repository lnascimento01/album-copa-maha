<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateRolePermissionsRequest;
use App\Models\Permission;
use App\Models\Role;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function __construct(private readonly AuditLogger $auditLogger) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Role::class);

        $roles = Role::query()
            ->with(['permissions:id,name,slug,group'])
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role): array => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
                'description' => $role->description,
                'is_system' => $role->is_system,
                'permissions' => $role->permissions->map(fn (Permission $permission): array => [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'slug' => $permission->slug,
                    'group' => $permission->group,
                ])->values()->all(),
            ])
            ->values();

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
            'allPermissions' => Permission::query()->orderBy('group')->orderBy('name')->get(['id', 'name', 'slug', 'group']),
        ]);
    }

    public function updatePermissions(UpdateRolePermissionsRequest $request, Role $role): RedirectResponse
    {
        $this->authorize('update', $role);

        if ($role->slug === 'admin') {
            return back()->withErrors([
                'permissions' => 'As permissões do role admin não podem ser alteradas.',
            ]);
        }

        $permissionIds = $request->validated('permission_ids');
        $role->permissions()->sync($permissionIds);

        $this->auditLogger->log(
            action: 'role.permissions_updated',
            actor: $request->user(),
            metadata: [
                'role_id' => $role->id,
                'permission_ids' => $permissionIds,
            ],
            entityType: Role::class,
            entityId: $role->id,
        );

        return back()->with('success', 'Permissões atualizadas.');
    }
}
