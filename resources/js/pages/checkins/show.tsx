import { Head, Link } from '@inertiajs/react';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { OriginBadge } from '@/components/ui/origin-badge';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';

type Pack = {
    id: number;
    status: string;
    size: number;
    source: string;
    created_at: string | null;
    opened_at: string | null;
    cancelled_at: string | null;
};

type Checkin = {
    id: number;
    status: string;
    checked_at: string | null;
    revoked_at: string | null;
    revoke_reason: string | null;
    notes: string | null;
    source: 'admin' | 'self';
    checked_by: { id: number; name: string; email: string } | null;
    activity: {
        id: number;
        title: string;
        type: string;
        status: string;
        description: string | null;
        starts_at: string | null;
        ends_at: string | null;
        team: { id: number; name: string };
        album: { id: number; name: string };
    };
    packs: Pack[];
};

export default function CheckinShow({ checkin }: { checkin: Checkin }) {
    return (
        <>
            <Head title={`Check-in #${checkin.id}`} />
            <div className="space-y-4 p-4 sm:p-5">
                <PageHeader
                    title={`Check-in #${checkin.id}`}
                    subtitle={`Atividade: ${checkin.activity.title}`}
                    actions={<Link href="/checkins" className="rounded-sm border border-zinc-300 px-3 py-2 text-xs">Voltar</Link>}
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-md border border-zinc-200 bg-white p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Status</div>
                        <div className="mt-2"><StatusBadge value={checkin.status} /></div>
                    </div>
                    <div className="rounded-md border border-zinc-200 bg-white p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Origem</div>
                        <div className="mt-2">
                            {checkin.source === 'self' ? (
                                <OriginBadge source="checkin" label="Você via QR/Código" />
                            ) : (
                                <OriginBadge source="admin" label={checkin.checked_by?.email ?? 'Administração'} />
                            )}
                        </div>
                    </div>
                    <div className="rounded-md border border-zinc-200 bg-white p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Marcado em</div>
                        <div className="mt-2 text-zinc-800">{checkin.checked_at ?? '-'}</div>
                    </div>
                    <div className="rounded-md border border-zinc-200 bg-white p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Revogado em</div>
                        <div className="mt-2 text-zinc-800">{checkin.revoked_at ?? '-'}</div>
                    </div>
                </div>

                <section className="rounded-md border border-zinc-200 bg-white p-4 text-sm">
                    <h2 className="text-sm font-semibold text-zinc-900">Descrição da atividade</h2>
                    <p className="mt-2 text-zinc-700">{checkin.activity.description ?? 'Sem descrição cadastrada.'}</p>
                </section>

                <DataTableShell title="Pacotes gerados" subtitle="Pacotes vinculados a este check-in.">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-200 text-left">
                                <th className="px-4 py-2">Pacote</th>
                                <th className="px-4 py-2">Origem</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Tamanho</th>
                                <th className="px-4 py-2">Aberto em</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {checkin.packs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8">
                                        <EmptyState title="Nenhum pacote gerado." />
                                    </td>
                                </tr>
                            ) : (
                                checkin.packs.map((pack) => (
                                    <tr key={pack.id} className="border-b border-zinc-100">
                                        <td className="px-4 py-2 font-mono text-xs text-zinc-700">#{pack.id}</td>
                                        <td className="px-4 py-2"><OriginBadge source={pack.source} /></td>
                                        <td className="px-4 py-2"><StatusBadge value={pack.status} /></td>
                                        <td className="px-4 py-2 text-zinc-700">{pack.size}</td>
                                        <td className="px-4 py-2 text-zinc-600">{pack.opened_at ?? '-'}</td>
                                        <td className="px-4 py-2"><Link className="text-xs underline" href={`/packs/${pack.id}`}>Ver pacote</Link></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTableShell>
            </div>
        </>
    );
}
