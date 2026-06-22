import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

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
    const page = usePage<{ flash?: { success?: string; error?: string } }>();

    const initialSelection = useMemo(() => {
        const map: Record<number, number[]> = {};
        roles.forEach((role) => {
            map[role.id] = role.permissions.map((permission) => permission.id);
        });
        return map;
    }, [roles]);

    const [selectedByRole, setSelectedByRole] = useState<Record<number, number[]>>(initialSelection);

    // Reset the selection when the roles prop changes, adjusting state during
    // render instead of synchronously inside an effect (react-hooks/
    // set-state-in-effect). `initialSelection` is a new object whenever `roles`
    // changes, so the reference comparison is the trigger.
    const [prevInitialSelection, setPrevInitialSelection] = useState(initialSelection);
    if (initialSelection !== prevInitialSelection) {
        setPrevInitialSelection(initialSelection);
        setSelectedByRole(initialSelection);
    }

    useEffect(() => {
        if (page.props.flash?.success) {
            toast.success(page.props.flash.success);
        }
        if (page.props.flash?.error) {
            toast.error(page.props.flash.error);
        }
    }, [page.props.flash]);

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
        const ids = selectedByRole[roleId] ?? [];
        router.patch(
            `/admin/roles/${roleId}/permissions`,
            { permission_ids: ids },
            {
                onError: () => toast.error('Erro ao salvar permissões.'),
            },
        );
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
                                {role.is_system ? 'Papel de sistema' : 'Papel personalizado'}
                            </div>
                        </div>

                        <div className="grid gap-2 md:grid-cols-2">
                            {allPermissions.map((permission) => {
                                const checked = (selectedByRole[role.id] ?? []).includes(permission.id);
                                const isLocked = role.slug === 'admin';

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

                        {role.slug === 'admin' ? (
                            <p className="mt-3 text-xs text-muted-foreground">
                                As permissões do role admin não podem ser alteradas.
                            </p>
                        ) : (
                            <button
                                type="button"
                                className="mt-3 cursor-pointer rounded-sm border bg-primary px-3 py-2 text-xs text-primary-foreground transition-all hover:brightness-110"
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
