import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { DataTableShell } from '@/components/ui/data-table-shell';
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

export default function AdminUsersIndex({ users, filters }: Props) {
    const page = usePage().props as { auth: { user?: { permissions?: string[] } } };
    const permissions = page.auth.user?.permissions ?? [];

    const [status, setStatus] = useState(filters.status ?? '');
    const [search, setSearch] = useState(filters.search ?? '');

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
        const reason = window.prompt('Motivo da rejeição:');

        if (!reason) {
            return;
        }

        router.patch(`/admin/users/${id}/reject`, { rejection_reason: reason }, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['users'] }),
        });
    };

    const suspend = (id: number) => {
        if (!window.confirm('Confirma suspender este usuário?')) {
            return;
        }

        router.patch(`/admin/users/${id}/suspend`, {}, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['users'] }),
        });
    };

    return (
        <>
            <Head title="Usuários" />
            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader title="Usuários" subtitle="Aprovação de cadastro, papéis e acesso operacional." />

                <form onSubmit={submitFilters} className="album-paper grid gap-3 p-4 md:grid-cols-4">
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Status</label>
                        <select
                            className="mt-1 w-full rounded-sm border bg-card border-border px-2 py-2 text-sm"
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
                            className="mt-1 w-full rounded-sm border bg-card border-border px-2 py-2 text-sm"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Nome ou e-mail"
                        />
                    </div>
                    <div className="flex items-end">
                        <button className="w-full rounded-sm border border-primary bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground" type="submit">
                            Filtrar
                        </button>
                    </div>
                </form>

                <DataTableShell title="Lista de usuários" subtitle="Ações disponíveis conforme permissões do operador.">
                    <ResponsiveDataList
                        items={users.data}
                        getKey={(user) => user.id}
                        empty={<EmptyState title="Nenhum usuário encontrado." description="Ajuste os filtros para ampliar a busca." />}
                        renderItem={(user) => (
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground">{user.name}</p>
                                        <p className="mt-1 truncate font-mono text-xs text-dim">{user.email}</p>
                                    </div>
                                    <StatusBadge value={user.approval_status} />
                                </div>
                                <div>
                                    <p className="responsive-data-key">Roles</p>
                                    <p className="responsive-data-value">{user.roles.map((role) => role.slug).join(', ') || '-'}</p>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Link className="app-link-chip" href={`/admin/users/${user.id}`}>Detalhes</Link>
                                    {canApprove ? (
                                        <button
                                            type="button"
                                            className="app-link-chip disabled:cursor-not-allowed disabled:opacity-55"
                                            onClick={() => approve(user.id)}
                                            disabled={user.approval_status === 'approved'}
                                        >
                                            {user.approval_status === 'approved' ? 'Aprovado' : 'Aprovar'}
                                        </button>
                                    ) : null}
                                    {canReject ? (
                                        <button
                                            type="button"
                                            className="app-link-chip disabled:cursor-not-allowed disabled:opacity-55"
                                            onClick={() => reject(user.id)}
                                            disabled={user.approval_status === 'rejected'}
                                        >
                                            {user.approval_status === 'rejected' ? 'Rejeitado' : 'Rejeitar'}
                                        </button>
                                    ) : null}
                                    {canSuspend ? (
                                        <button
                                            type="button"
                                            className="app-link-chip disabled:cursor-not-allowed disabled:opacity-55"
                                            onClick={() => suspend(user.id)}
                                            disabled={user.approval_status === 'suspended'}
                                        >
                                            {user.approval_status === 'suspended' ? 'Suspenso' : 'Suspender'}
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    />
                    <table className="hidden min-w-full text-sm md:table">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="px-4 py-2">Nome</th>
                                <th className="px-4 py-2">E-mail</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Roles</th>
                                <th className="px-4 py-2">Ações</th>
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
                                    <tr key={user.id} className="admin-table-row align-top">
                                        <td className="px-4 py-2 text-foreground">{user.name}</td>
                                        <td className="px-4 py-2 font-mono text-xs text-dim">{user.email}</td>
                                        <td className="px-4 py-2"><StatusBadge value={user.approval_status} /></td>
                                        <td className="px-4 py-2 text-dim">
                                            {user.roles.map((role) => role.slug).join(', ') || '-'}
                                        </td>
                                        <td className="space-x-2 px-4 py-2">
                                            <Link className="text-xs underline" href={`/admin/users/${user.id}`}>
                                                Detalhes
                                            </Link>
                                            {canApprove ? (
                                                <button
                                                    type="button"
                                                    className="text-xs underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60"
                                                    onClick={() => approve(user.id)}
                                                    disabled={user.approval_status === 'approved'}
                                                >
                                                    {user.approval_status === 'approved' ? 'Aprovado' : 'Aprovar'}
                                                </button>
                                            ) : null}
                                            {canReject ? (
                                                <button
                                                    type="button"
                                                    className="text-xs underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60"
                                                    onClick={() => reject(user.id)}
                                                    disabled={user.approval_status === 'rejected'}
                                                >
                                                    {user.approval_status === 'rejected' ? 'Rejeitado' : 'Rejeitar'}
                                                </button>
                                            ) : null}
                                            {canSuspend ? (
                                                <button
                                                    type="button"
                                                    className="text-xs underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60"
                                                    onClick={() => suspend(user.id)}
                                                    disabled={user.approval_status === 'suspended'}
                                                >
                                                    {user.approval_status === 'suspended' ? 'Suspenso' : 'Suspender'}
                                                </button>
                                            ) : null}
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
                            className={`rounded-sm border px-2 py-1 text-xs font-semibold ${link.active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-dim'}`}
                        >
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
