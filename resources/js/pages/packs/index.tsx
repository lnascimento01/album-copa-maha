import { Head, Link } from '@inertiajs/react';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricCard } from '@/components/ui/metric-card';
import { OriginBadge } from '@/components/ui/origin-badge';
import { PageHeader } from '@/components/ui/page-header';
import { ProgressBar } from '@/components/ui/progress-bar';
import { StatusBadge } from '@/components/ui/status-badge';

type PackRow = {
    id: number;
    size: number;
    status: string;
    source: string;
    created_at: string | null;
    opened_at?: string | null;
    cancelled_at?: string | null;
    album: { id: number; name: string; slug: string };
    activity?: { id: number; title: string; type: string } | null;
    reward_code?: { id: number; code: string; title: string } | null;
    social_mission?: { id: number; title: string; slug: string } | null;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

type Props = {
    pendingPacks: PackRow[];
    historyPacks: { data: PackRow[]; links: PaginationLink[] };
    stats: { pending: number; opened: number; unlocked: number; albumTotal: number };
    can?: { createShareCard: boolean };
};

function sourceLabel(pack: PackRow): string {
    if (pack.source === 'checkin' && pack.activity) {
        return `Check-in: ${pack.activity.title}`;
    }

    if (pack.source === 'reward_code' && pack.reward_code) {
        return `Código: ${pack.reward_code.code}`;
    }

    if (pack.source === 'social_mission' && pack.social_mission) {
        return `Missão: ${pack.social_mission.title}`;
    }

    return 'Manual';
}

export default function PacksIndex({ pendingPacks, historyPacks, stats, can }: Props) {
    const percentage = stats.albumTotal > 0 ? Math.round((stats.unlocked / stats.albumTotal) * 100) : 0;

    return (
        <>
            <Head title="Meus Pacotes" />
            <div className="space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Meus Pacotes"
                    subtitle="Abra seus pacotes pendentes e acompanhe sua evolução no álbum."
                    actions={<Link href="/album" className="rounded-sm border border-zinc-300 px-3 py-2 text-xs">Ver álbum</Link>}
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard label="Pendentes" value={stats.pending} accent={stats.pending > 0 ? 'warning' : 'default'} />
                    <MetricCard label="Abertos" value={stats.opened} />
                    <MetricCard label="Figurinhas desbloqueadas" value={stats.unlocked} />
                    <MetricCard label="Progresso do álbum" value={`${percentage}%`} hint={<ProgressBar value={percentage} />} accent="success" />
                </div>

                <section className="rounded-md border border-zinc-200 bg-white p-4">
                    <h2 className="text-sm font-semibold text-zinc-900">Pacotes pendentes</h2>
                    {pendingPacks.length === 0 ? (
                        <div className="mt-3">
                            <EmptyState title="Nenhum pacote pendente." description="Participe de atividades, resgate códigos e conclua missões para receber novos pacotes." />
                        </div>
                    ) : (
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {pendingPacks.map((pack) => (
                                <Link key={pack.id} href={`/packs/${pack.id}`} className="rounded-md border border-zinc-200 bg-zinc-50 p-3 transition hover:bg-zinc-100">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="text-xs uppercase tracking-wide text-zinc-500">Pacote #{pack.id}</div>
                                            <div className="mt-1 text-lg font-semibold text-zinc-900">{pack.size} figurinhas</div>
                                        </div>
                                        <StatusBadge value={pack.status} />
                                    </div>
                                    <div className="mt-2 text-xs text-zinc-600">{pack.album.name}</div>
                                    <div className="mt-2">
                                        <OriginBadge source={pack.source} label={sourceLabel(pack)} />
                                    </div>
                                    <div className="mt-3 inline-flex rounded-sm border border-zinc-300 bg-white px-2 py-1 text-[11px] font-medium text-zinc-800">
                                        Abrir pacote
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <DataTableShell title="Histórico de pacotes" subtitle="Origem, status e data de abertura para auditoria pessoal.">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-200 text-left">
                                <th className="px-4 py-2">Pacote</th>
                                <th className="px-4 py-2">Álbum</th>
                                <th className="px-4 py-2">Origem</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Tamanho</th>
                                <th className="px-4 py-2">Criado em</th>
                                <th className="px-4 py-2">Aberto em</th>
                                <th className="px-4 py-2">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyPacks.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8">
                                        <EmptyState title="Nenhum pacote encontrado." description="Seu histórico aparecerá aqui após as primeiras concessões." />
                                    </td>
                                </tr>
                            ) : (
                                historyPacks.data.map((pack) => (
                                    <tr key={pack.id} className="border-b border-zinc-100">
                                        <td className="px-4 py-2 font-mono text-xs text-zinc-700">#{pack.id}</td>
                                        <td className="px-4 py-2 text-zinc-800">{pack.album.name}</td>
                                        <td className="px-4 py-2"><OriginBadge source={pack.source} label={sourceLabel(pack)} /></td>
                                        <td className="px-4 py-2"><StatusBadge value={pack.status} /></td>
                                        <td className="px-4 py-2 text-zinc-700">{pack.size}</td>
                                        <td className="px-4 py-2 text-zinc-600">{pack.created_at ?? '-'}</td>
                                        <td className="px-4 py-2 text-zinc-600">{pack.opened_at ?? '-'}</td>
                                        <td className="space-x-2 px-4 py-2">
                                            <Link href={`/packs/${pack.id}`} className="text-xs underline">Detalhes</Link>
                                            {can?.createShareCard && pack.status === 'opened' ? (
                                                <Link
                                                    href="/share-cards"
                                                    method="post"
                                                    data={{ type: 'pack_opened', related_id: pack.id }}
                                                    as="button"
                                                    className="text-xs underline"
                                                >
                                                    Gerar card
                                                </Link>
                                            ) : null}
                                        </td>
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
