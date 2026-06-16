import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';

type Submission = {
    id: number;
    status: string;
    submitted_at: string | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
    evidence_text: string | null;
    evidence_url: string | null;
    mission: { id: number; title: string; slug: string };
    user: { id: number; email: string };
    reviewer: { id: number; email: string } | null;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

type Props = {
    submissions: { data: Submission[]; links: PaginationLink[] };
    filters: { mission_id: number | null; user_id: number | null; status: string; search: string };
    statuses: string[];
    missions: { id: number; title: string }[];
    users: { id: number; email: string }[];
};

export default function AdminSocialMissionSubmissionsIndex({ submissions, filters, statuses, missions, users }: Props) {
    const [missionId, setMissionId] = useState(filters.mission_id ? String(filters.mission_id) : '');
    const [userId, setUserId] = useState(filters.user_id ? String(filters.user_id) : '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [search, setSearch] = useState(filters.search ?? '');

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get('/admin/social-mission-submissions', {
            mission_id: missionId,
            user_id: userId,
            status,
            search,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Fila de Submissões Sociais" />
            <div className="space-y-4 p-4 sm:p-5">
                <PageHeader title="Fila de Submissões Sociais" subtitle="Validação operacional de missões enviadas pelos participantes." />

                <form onSubmit={submit} className="grid gap-3 rounded-md border border-border bg-card p-4 md:grid-cols-4">
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Missão</label>
                        <select value={missionId} onChange={(event) => setMissionId(event.target.value)} className="mt-1 w-full rounded-sm border border-input px-2 py-2 text-sm">
                            <option value="">Todas</option>
                            {missions.map((mission) => (<option key={mission.id} value={mission.id}>{mission.title}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Usuário</label>
                        <select value={userId} onChange={(event) => setUserId(event.target.value)} className="mt-1 w-full rounded-sm border border-input px-2 py-2 text-sm">
                            <option value="">Todos</option>
                            {users.map((user) => (<option key={user.id} value={user.id}>{user.email}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Status</label>
                        <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 w-full rounded-sm border border-input px-2 py-2 text-sm">
                            <option value="">Todos</option>
                            {statuses.map((item) => (<option key={item} value={item}>{item}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Busca</label>
                        <input value={search} onChange={(event) => setSearch(event.target.value)} className="mt-1 w-full rounded-sm border border-input px-2 py-2 text-sm" placeholder="Texto/URL" />
                    </div>
                    <div className="md:col-span-4 flex justify-end">
                        <button type="submit" className="cursor-pointer rounded-sm border bg-primary px-3 py-2 text-sm text-primary-foreground transition-all hover:brightness-110">Filtrar</button>
                    </div>
                </form>

                <DataTableShell title="Submissões" subtitle="Fila de revisão com status e participante.">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Missão</th>
                                <th className="px-4 py-2">Participante</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Data</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8">
                                        <EmptyState title="Nenhuma submissão pendente." description="Sem itens para revisão com os filtros atuais." />
                                    </td>
                                </tr>
                            ) : (
                                submissions.data.map((submission) => (
                                    <tr key={submission.id} className="border-b border-border/70">
                                        <td className="px-4 py-2 font-mono text-xs text-dim">#{submission.id}</td>
                                        <td className="px-4 py-2 text-foreground">{submission.mission.title}</td>
                                        <td className="px-4 py-2 text-dim">{submission.user.email}</td>
                                        <td className="px-4 py-2"><StatusBadge value={submission.status} /></td>
                                        <td className="px-4 py-2 text-dim">{submission.submitted_at ?? '-'}</td>
                                        <td className="px-4 py-2"><Link href={`/admin/social-mission-submissions/${submission.id}`} className="text-xs underline">Detalhes</Link></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTableShell>

                <div className="flex flex-wrap gap-2">
                    {submissions.links.map((link, index) => (
                        <button key={`${link.label}-${index}`} type="button" onClick={() => link.url && router.visit(link.url)} disabled={!link.url} className={`rounded-sm border px-2 py-1 text-xs ${link.active ? 'bg-primary text-primary-foreground' : 'bg-card text-dim'}`}>
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
