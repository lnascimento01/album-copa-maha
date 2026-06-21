import { Head, Link, router, usePage } from '@inertiajs/react';
import { Ban, Check, Eye, MoreVertical, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ConfirmDialog, PromptDialog } from '@/components/ui/action-dialog';
import { Button } from '@/components/ui/button';
import { DataTableShell } from '@/components/ui/data-table-shell';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { ResponsiveDataList } from '@/components/ui/responsive-data-list';
import { StatusBadge } from '@/components/ui/status-badge';

type Role = {
    id: number;
    name: string;
    slug: string;
};

type UserItem = {
    id: number;
    name: string;
    email: string;
    approval_status: string;
    roles: Role[];
    created_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type UsersPayload = {
    data: UserItem[];
    links: PaginationLink[];
};

type Props = {
    users: UsersPayload;
    filters: {
        status: string;
        search: string;
    };
};

type RowActions = {
    canApprove: boolean;
    canReject: boolean;
    canSuspend: boolean;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    onSuspend: (id: number) => void;
};

function initials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}

/**
 * Per-row actions: a one-tap primary button for the common case (approving a
 * pending user) plus a dropdown with the full set — proper click targets
 * instead of cramped text links.
 */
function UserRowActions({ user, actions }: { user: UserItem; actions: RowActions }) {
    const { canApprove, canReject, canSuspend, onApprove, onReject, onSuspend } = actions;
    const isApproved = user.approval_status === 'approved';
    const isRejected = user.approval_status === 'rejected';
    const isSuspended = user.approval_status === 'suspended';

    return (
        <div className="flex items-center justify-end gap-2">
            {canApprove && !isApproved ? (
                <Button type="button" size="sm" variant="success" onClick={() => onApprove(user.id)}>
                    <Check />
                    Aprovar
                </Button>
            ) : null}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button type="button" size="icon" variant="outline" aria-label={`Ações para ${user.name}`}>
                        <MoreVertical />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${user.id}`}>
                            <Eye />
                            Detalhes
                        </Link>
                    </DropdownMenuItem>
                    {canApprove ? (
                        <DropdownMenuItem disabled={isApproved} onSelect={() => onApprove(user.id)}>
                            <Check />
                            {isApproved ? 'Aprovado' : 'Aprovar'}
                        </DropdownMenuItem>
                    ) : null}
                    {canReject ? (
                        <DropdownMenuItem variant="destructive" disabled={isRejected} onSelect={() => onReject(user.id)}>
                            <XCircle />
                            {isRejected ? 'Rejeitado' : 'Rejeitar'}
                        </DropdownMenuItem>
                    ) : null}
                    {canSuspend ? (
                        <DropdownMenuItem variant="destructive" disabled={isSuspended} onSelect={() => onSuspend(user.id)}>
                            <Ban />
                            {isSuspended ? 'Suspenso' : 'Suspender'}
                        </DropdownMenuItem>
                    ) : null}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default function AdminUsersIndex({ users, filters }: Props) {
    const page = usePage().props as { auth: { user?: { permissions?: string[] } } };
    const permissions = page.auth.user?.permissions ?? [];

    const [status, setStatus] = useState(filters.status ?? '');
    const [search, setSearch] = useState(filters.search ?? '');
    const [rejectTarget, setRejectTarget] = useState<number | null>(null);
    const [suspendTarget, setSuspendTarget] = useState<number | null>(null);

    const canApprove = permissions.includes('users.approve');
    const canReject = permissions.includes('users.reject');
    const canSuspend = permissions.includes('users.update');

    const submitFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            '/admin/users',
            { status, search },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const approve = (id: number) => {
        router.patch(`/admin/users/${id}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['users'] }),
        });
    };

    const reject = (id: number) => {
        setRejectTarget(id);
    };

    const suspend = (id: number) => {
        setSuspendTarget(id);
    };

    const rowActions: RowActions = {
        canApprove,
        canReject,
        canSuspend,
        onApprove: approve,
        onReject: reject,
        onSuspend: suspend,
    };

    return (
        <>
            <Head title="Usuários" />
            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader title="Usuários" subtitle="Aprovação de cadastro, papéis e acesso operacional." />

                <form onSubmit={submitFilters} className="album-paper grid items-end gap-3 p-4 md:grid-cols-4">
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Status</label>
                        <select
                            className="mt-1 h-9 w-full rounded-sm border bg-card border-border px-2 text-sm"
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="pending">Pendente</option>
                            <option value="approved">Aprovado</option>
                            <option value="rejected">Rejeitado</option>
                            <option value="suspended">Suspenso</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs uppercase tracking-wide text-dim">Busca</label>
                        <input
                            className="mt-1 h-9 w-full rounded-sm border bg-card border-border px-2 text-sm"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Nome ou e-mail"
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Filtrar
                    </Button>
                </form>

                <DataTableShell title="Lista de usuários" subtitle="Ações disponíveis conforme permissões do operador.">
                    <ResponsiveDataList
                        items={users.data}
                        getKey={(user) => user.id}
                        empty={<EmptyState title="Nenhum usuário encontrado." description="Ajuste os filtros para ampliar a busca." />}
                        renderItem={(user) => (
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[color:var(--primary-100)] text-xs font-bold text-[color:var(--primary-600)]">
                                            {initials(user.name)}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                                            <p className="truncate font-mono text-xs text-dim">{user.email}</p>
                                        </div>
                                    </div>
                                    <StatusBadge value={user.approval_status} />
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="responsive-data-key">Roles</p>
                                        <p className="responsive-data-value">{user.roles.map((role) => role.slug).join(', ') || '-'}</p>
                                    </div>
                                    <UserRowActions user={user} actions={rowActions} />
                                </div>
                            </div>
                        )}
                    />
                    <table className="hidden min-w-full text-sm md:table">
                        <thead>
                            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-dim">
                                <th className="px-4 py-2 font-semibold">Nome</th>
                                <th className="px-4 py-2 font-semibold">E-mail</th>
                                <th className="px-4 py-2 font-semibold">Status</th>
                                <th className="px-4 py-2 font-semibold">Roles</th>
                                <th className="px-4 py-2 text-right font-semibold">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8">
                                        <EmptyState title="Nenhum usuário encontrado." description="Ajuste os filtros para ampliar a busca." />
                                    </td>
                                </tr>
                            ) : (
                                users.data.map((user) => (
                                    <tr key={user.id} className="admin-table-row align-middle">
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-3">
                                                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[color:var(--primary-100)] text-[11px] font-bold text-[color:var(--primary-600)]">
                                                    {initials(user.name)}
                                                </span>
                                                <span className="font-medium text-foreground">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 font-mono text-xs text-dim">{user.email}</td>
                                        <td className="px-4 py-2.5"><StatusBadge value={user.approval_status} /></td>
                                        <td className="px-4 py-2.5 text-dim">
                                            {user.roles.map((role) => role.slug).join(', ') || '-'}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <UserRowActions user={user} actions={rowActions} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTableShell>

                <div className="flex flex-wrap gap-2">
                    {users.links.map((link, index) => (
                        <button
                            key={`${link.label}-${index}`}
                            type="button"
                            onClick={() => {
                                if (link.url) {
                                    router.visit(link.url);
                                }
                            }}
                            disabled={!link.url}
                            className={`cursor-pointer rounded-sm border px-2.5 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${link.active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-dim hover:bg-accent'}`}
                        >
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </button>
                    ))}
                </div>
            </div>

            <PromptDialog
                open={rejectTarget !== null}
                title="Rejeitar usuário"
                label="Motivo da rejeição"
                required={true}
                destructive={true}
                confirmLabel="Rejeitar"
                onConfirm={(reason) => {
                    const id = rejectTarget;
                    setRejectTarget(null);

                    if (id !== null) {
                        router.patch(`/admin/users/${id}/reject`, { rejection_reason: reason }, {
                            preserveScroll: true,
                            onSuccess: () => router.reload({ only: ['users'] }),
                        });
                    }
                }}
                onCancel={() => setRejectTarget(null)}
            />

            <ConfirmDialog
                open={suspendTarget !== null}
                title="Suspender usuário"
                message="Confirma suspender este usuário?"
                destructive={true}
                confirmLabel="Suspender"
                onConfirm={() => {
                    const id = suspendTarget;
                    setSuspendTarget(null);

                    if (id !== null) {
                        router.patch(`/admin/users/${id}/suspend`, {}, {
                            preserveScroll: true,
                            onSuccess: () => router.reload({ only: ['users'] }),
                        });
                    }
                }}
                onCancel={() => setSuspendTarget(null)}
            />
        </>
    );
}
