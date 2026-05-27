import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type Permission = {
    id: number;
    name: string;
    slug: string;
    group: string;
};

type Role = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_system: boolean;
    permissions: Permission[];
};

type Props = {
    roles: Role[];
    allPermissions: Permission[];
};

export default function AdminRolesIndex({ roles, allPermissions }: Props) {
    const initialSelection = useMemo(() => {
        const map: Record<number, number[]> = {};

        roles.forEach((role) => {
            map[role.id] = role.permissions.map((permission) => permission.id);
        });

        return map;
    }, [roles]);

    const [selectedByRole, setSelectedByRole] = useState<Record<number, number[]>>(initialSelection);

    const toggle = (roleId: number, permissionId: number) => {
        setSelectedByRole((current) => {
            const selected = current[roleId] ?? [];
            const exists = selected.includes(permissionId);

            return {
                ...current,
                [roleId]: exists
                    ? selected.filter((id) => id !== permissionId)
                    : [...selected, permissionId],
            };
        });
    };

    const save = (roleId: number) => {
        router.patch(`/admin/roles/${roleId}/permissions`, {
            permission_ids: selectedByRole[roleId] ?? [],
        });
    };

    return (
        <>
            <Head title="Papéis e Permissões" />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Papéis e Permissões</h1>

                {roles.map((role) => (
                    <div key={role.id} className="rounded-sm border p-4">
                        <div className="mb-3 flex items-center justify-between gap-4">
                            <div>
                                <div className="font-medium">{role.name}</div>
                                <div className="font-mono text-xs text-muted-foreground">{role.slug}</div>
                            </div>
                            <div className="text-xs uppercase text-muted-foreground">
                                {role.is_system ? 'System role' : 'Custom role'}
                            </div>
                        </div>

                        <div className="grid gap-2 md:grid-cols-2">
                            {allPermissions.map((permission) => {
                                const checked = (selectedByRole[role.id] ?? []).includes(permission.id);
                                const isLocked = role.is_system && ['admin', 'participant'].includes(role.slug);

                                return (
                                    <label key={permission.id} className="flex items-start gap-2 rounded-sm border p-2 text-sm">
                                        <input
                                            type="checkbox"
                                            className="mt-0.5"
                                            checked={checked}
                                            disabled={isLocked}
                                            onChange={() => toggle(role.id, permission.id)}
                                        />
                                        <span>
                                            <span className="font-mono text-xs">{permission.slug}</span>
                                            <br />
                                            <span className="text-xs text-muted-foreground">{permission.name}</span>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        {role.is_system && ['admin', 'participant'].includes(role.slug) ? (
                            <p className="mt-3 text-xs text-muted-foreground">
                                Role de sistema crítico não editável nesta etapa.
                            </p>
                        ) : (
                            <button
                                type="button"
                                className="mt-3 rounded-sm border bg-black px-3 py-2 text-xs text-white"
                                onClick={() => save(role.id)}
                            >
                                Salvar permissões
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
}
