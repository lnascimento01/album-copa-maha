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
                    actions={<Link href="/checkins" className="rounded-sm border bg-card border-border px-3 py-2 text-xs">Voltar</Link>}
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-md border border-border bg-card p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-dim">Status</div>
                        <div className="mt-2"><StatusBadge value={checkin.status} /></div>
                    </div>
                    <div className="rounded-md border border-border bg-card p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-dim">Origem</div>
                        <div className="mt-2">
                            {checkin.source === 'self' ? (
                                <OriginBadge source="checkin" label="Você via QR/Código" />
                            ) : (
                                <OriginBadge source="admin" label={checkin.checked_by?.email ?? 'Administração'} />
                            )}
                        </div>
                    </div>
                    <div className="rounded-md border border-border bg-card p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-dim">Marcado em</div>
                        <div className="mt-2 text-foreground">{checkin.checked_at ?? '-'}</div>
                    </div>
                    <div className="rounded-md border border-border bg-card p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-dim">Revogado em</div>
                        <div className="mt-2 text-foreground">{checkin.revoked_at ?? '-'}</div>
                    </div>
                </div>

                <section className="rounded-md border border-border bg-card p-4 text-sm">
                    <h2 className="text-sm font-semibold text-foreground">Descrição da atividade</h2>
                    <p className="mt-2 text-dim">{checkin.activity.description ?? 'Sem descrição cadastrada.'}</p>
                </section>

                <DataTableShell title="Pacotes gerados" subtitle="Pacotes vinculados a este check-in.">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left">
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
                                    <tr key={pack.id} className="border-b border-border/60">
                                        <td className="px-4 py-2 font-mono text-xs text-dim">#{pack.id}</td>
                                        <td className="px-4 py-2"><OriginBadge source={pack.source} /></td>
                                        <td className="px-4 py-2"><StatusBadge value={pack.status} /></td>
                                        <td className="px-4 py-2 text-dim">{pack.size}</td>
                                        <td className="px-4 py-2 text-dim">{pack.opened_at ?? '-'}</td>
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
