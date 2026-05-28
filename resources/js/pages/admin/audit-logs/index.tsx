import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';

type UserOption = {
    id: number;
    name: string;
    email: string;
};

type AuditLog = {
    id: number;
    action: string;
    entity_type: string | null;
    entity_id: number | null;
    metadata: Record<string, unknown> | null;
    ip_address: string | null;
    created_at: string | null;
    actor: UserOption | null;
    target: UserOption | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    auditLogs: {
        data: AuditLog[];
        links: PaginationLink[];
    };
    filters: {
        actor_id: number | null;
        target_id: number | null;
        action: string;
        date: string;
    };
    actors: UserOption[];
    targets: UserOption[];
    actions: string[];
};

export default function AuditLogsIndex({ auditLogs, filters, actors, targets, actions }: Props) {
    const [actorId, setActorId] = useState<string>(filters.actor_id ? String(filters.actor_id) : '');
    const [targetId, setTargetId] = useState<string>(filters.target_id ? String(filters.target_id) : '');
    const [action, setAction] = useState(filters.action ?? '');
    const [date, setDate] = useState(filters.date ?? '');

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            '/admin/audit-logs',
            {
                actor_id: actorId,
                target_id: targetId,
                action,
                date,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <>
            <Head title="Auditoria" />
            <div className="space-y-4 p-4 sm:p-5">
                <PageHeader title="Auditoria" subtitle="Rastreabilidade de ações críticas do sistema e da operação." />

                <form onSubmit={submit} className="grid gap-3 rounded-md border border-border bg-card p-4 md:grid-cols-5">
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Ator</label>
                        <select className="mt-1 w-full rounded-sm border bg-card border-border px-2 py-2 text-sm" value={actorId} onChange={(event) => setActorId(event.target.value)}>
                            <option value="">Todos</option>
                            {actors.map((actor) => (
                                <option key={actor.id} value={actor.id}>
                                    {actor.email}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Alvo</label>
                        <select className="mt-1 w-full rounded-sm border bg-card border-border px-2 py-2 text-sm" value={targetId} onChange={(event) => setTargetId(event.target.value)}>
                            <option value="">Todos</option>
                            {targets.map((target) => (
                                <option key={target.id} value={target.id}>
                                    {target.email}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Ação</label>
                        <select className="mt-1 w-full rounded-sm border bg-card border-border px-2 py-2 text-sm" value={action} onChange={(event) => setAction(event.target.value)}>
                            <option value="">Todas</option>
                            {actions.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Data</label>
                        <input
                            type="date"
                            className="mt-1 w-full rounded-sm border bg-card border-border px-2 py-2 text-sm"
                            value={date}
                            onChange={(event) => setDate(event.target.value)}
                        />
                    </div>
                    <div className="flex items-end">
                        <button className="w-full rounded-sm border bg-primary px-3 py-2 text-sm text-primary-foreground" type="submit">
                            Filtrar
                        </button>
                    </div>
                </form>

                <DataTableShell title="Eventos de auditoria" subtitle="Logs filtrados por ator, alvo, ação e período.">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="px-4 py-2">Ação</th>
                                <th className="px-4 py-2">Ator</th>
                                <th className="px-4 py-2">Alvo</th>
                                <th className="px-4 py-2">Data</th>
                                <th className="px-4 py-2">Metadata</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8">
                                        <EmptyState title="Nenhum evento de auditoria encontrado para o filtro." />
                                    </td>
                                </tr>
                            ) : (
                                auditLogs.data.map((log) => (
                                    <tr key={log.id} className="border-b border-border/60 align-top">
                                        <td className="px-4 py-2 font-mono text-xs text-foreground">{log.action}</td>
                                        <td className="px-4 py-2 text-dim">{log.actor?.email ?? '-'}</td>
                                        <td className="px-4 py-2 text-dim">{log.target?.email ?? '-'}</td>
                                        <td className="px-4 py-2 text-dim">{log.created_at ?? '-'}</td>
                                        <td className="px-4 py-2">
                                            <pre className="max-w-[360px] overflow-x-auto whitespace-pre-wrap text-xs text-dim">
                                                {JSON.stringify(log.metadata ?? {}, null, 2)}
                                            </pre>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTableShell>

                <div className="flex flex-wrap gap-2">
                    {auditLogs.links.map((link, index) => (
                        <button
                            key={`${link.label}-${index}`}
                            type="button"
                            onClick={() => {
                                if (link.url) {
                                    router.visit(link.url);
                                }
                            }}
                            disabled={!link.url}
                            className={`rounded-sm border px-2 py-1 text-xs ${link.active ? 'bg-primary text-primary-foreground' : 'bg-white text-dim'}`}
                        >
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
