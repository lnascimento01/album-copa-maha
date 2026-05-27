import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
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
        router.patch(`/admin/users/${id}/approve`);
    };

    const reject = (id: number) => {
        const reason = window.prompt('Motivo da rejeição:');

        if (!reason) {
            return;
        }

        router.patch(`/admin/users/${id}/reject`, { rejection_reason: reason });
    };

    const suspend = (id: number) => {
        if (!window.confirm('Confirma suspender este usuário?')) {
            return;
        }

        router.patch(`/admin/users/${id}/suspend`);
    };

    return (
        <>
            <Head title="Usuários" />
            <div className="space-y-4 p-4 sm:p-5">
                <PageHeader title="Usuários" subtitle="Aprovação de cadastro, papéis e acesso operacional." />

                <form onSubmit={submitFilters} className="grid gap-3 rounded-md border border-zinc-200 bg-white p-4 md:grid-cols-4">
                    <div>
                        <label className="text-xs uppercase tracking-wide text-zinc-500">Status</label>
                        <select
                            className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm"
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
                        <label className="text-xs uppercase tracking-wide text-zinc-500">Busca</label>
                        <input
                            className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Nome ou e-mail"
                        />
                    </div>
                    <div className="flex items-end">
                        <button className="w-full rounded-sm border bg-zinc-950 px-3 py-2 text-sm text-white" type="submit">
                            Filtrar
                        </button>
                    </div>
                </form>

                <DataTableShell title="Lista de usuários" subtitle="Ações disponíveis conforme permissões do operador.">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-200 text-left">
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
                                    <tr key={user.id} className="border-b border-zinc-100 align-top">
                                        <td className="px-4 py-2 text-zinc-900">{user.name}</td>
                                        <td className="px-4 py-2 font-mono text-xs text-zinc-700">{user.email}</td>
                                        <td className="px-4 py-2"><StatusBadge value={user.approval_status} /></td>
                                        <td className="px-4 py-2 text-zinc-700">
                                            {user.roles.map((role) => role.slug).join(', ') || '-'}
                                        </td>
                                        <td className="space-x-2 px-4 py-2">
                                            <Link className="text-xs underline" href={`/admin/users/${user.id}`}>
                                                Detalhes
                                            </Link>
                                            {canApprove ? (
                                                <button
                                                    type="button"
                                                    className="text-xs underline"
                                                    onClick={() => approve(user.id)}
                                                >
                                                    Aprovar
                                                </button>
                                            ) : null}
                                            {canReject ? (
                                                <button
                                                    type="button"
                                                    className="text-xs underline"
                                                    onClick={() => reject(user.id)}
                                                >
                                                    Rejeitar
                                                </button>
                                            ) : null}
                                            {canSuspend ? (
                                                <button
                                                    type="button"
                                                    className="text-xs underline"
                                                    onClick={() => suspend(user.id)}
                                                >
                                                    Suspender
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
                            className={`rounded-sm border px-2 py-1 text-xs ${link.active ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-700'}`}
                        >
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
