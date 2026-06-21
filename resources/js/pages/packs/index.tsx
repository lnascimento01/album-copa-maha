import { Head, Link, usePage } from '@inertiajs/react';
import type { DriveStep } from 'driver.js';
import { PageTour, TourReplayButton } from '@/components/page-tour';
import ShareExportPanel from '@/components/share-export-panel';
import { DataTableShell } from '@/components/ui/data-table-shell';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricCard } from '@/components/ui/metric-card';
import { OriginBadge } from '@/components/ui/origin-badge';
import { PageHeader } from '@/components/ui/page-header';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ResponsiveDataList } from '@/components/ui/responsive-data-list';
import { StatusBadge } from '@/components/ui/status-badge';
import { fmtDateTimeBr } from '@/lib/date';

const TOUR_STEPS: DriveStep[] = [
    {
        popover: {
            title: 'Seus pacotes 📦',
            description: 'Aqui é onde você abre pacotes e ganha figurinhas novas para o álbum. Vamos ver onde fica cada coisa.',
        },
    },
    {
        element: '[data-tour="packs-pending"]',
        popover: {
            title: 'Pacotes disponíveis',
            description: 'Seus pacotes prontos para abrir aparecem aqui. Toque em um pacote para abri-lo e revelar as figurinhas.',
        },
    },
    {
        element: '[data-tour="packs-stats"]',
        popover: {
            title: 'Seu resumo',
            description: 'Acompanhe pacotes pendentes, abertos e o seu progresso no álbum.',
        },
    },
    {
        popover: {
            title: 'Pronto! 🎉',
            description: 'Ganhe pacotes participando de atividades, resgatando códigos e concluindo missões.',
        },
    },
];

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

/**
 * Inline "export as a post-ready image" for an opened pack — opens the share
 * panel in a dialog straight from the list, no extra navigation or record.
 */
function PackShareButton({ pack, userName, className }: { pack: PackRow; userName: string; className: string }) {
    const count = pack.size;
    const plural = count !== 1 ? 's' : '';
    const payload = {
        type: 'pack_opened',
        title: 'Abri um pacote!',
        subtitle: `${count} figurinha${plural} no Álbum da Copa AAPH`,
        metric: count,
        album_name: pack.album.name,
        user_name: userName,
        date: pack.opened_at ?? '',
    };
    const shareCopy = `Abri um pacote no Álbum da Copa AAPH e consegui ${count} figurinha${plural}! #CopaAAPH`;

    return (
        <Dialog>
            <DialogTrigger className={className}>Compartilhar</DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Compartilhar pacote #{pack.id}</DialogTitle>
                    <DialogDescription>Gere uma imagem pronta para postar nas suas redes.</DialogDescription>
                </DialogHeader>
                <ShareExportPanel payload={payload} shareCopy={shareCopy} fileBase={`pacote-${pack.id}`} />
            </DialogContent>
        </Dialog>
    );
}

export default function PacksIndex({ pendingPacks, historyPacks, stats, can }: Props) {
    const page = usePage<{ auth?: { user?: { name?: string } } }>();
    const userName = page.props.auth?.user?.name ?? 'Participante AAPH';
    const percentage = stats.albumTotal > 0 ? Math.round((stats.unlocked / stats.albumTotal) * 100) : 0;

    return (
        <>
            <Head title="Meus Pacotes" />
            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Meus Pacotes"
                    subtitle="Abra seus pacotes pendentes e avance no Álbum da Copa AAPH."
                    actions={(
                        <div className="flex flex-wrap gap-2">
                            <TourReplayButton tourKey="packs-index" />
                            <Link href="/album" className="rounded-sm border border-border bg-card px-3 py-2 text-xs font-semibold">Ver álbum</Link>
                        </div>
                    )}
                />

                <section className="season-hero">
                    <div className="relative z-10">
                        <p className="season-kicker">Sala de abertura</p>
                        <h2 className="mt-2 text-2xl font-semibold text-primary-foreground">Pacotes da rodada</h2>
                        <p className="mt-1 max-w-xl text-sm text-primary-foreground/85">
                            Cada pacote revela novas figurinhas para completar páginas do seu álbum.
                        </p>
                    </div>
                </section>

                <div data-tour="packs-stats" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard label="Pendentes" value={stats.pending} accent={stats.pending > 0 ? 'warning' : 'default'} />
                    <MetricCard label="Abertos" value={stats.opened} />
                    <MetricCard label="Figurinhas desbloqueadas" value={stats.unlocked} />
                    <MetricCard label="Progresso do álbum" value={`${percentage}%`} hint={<ProgressBar value={percentage} />} accent="success" />
                </div>

                <section data-tour="packs-pending" className="album-paper p-4">
                    <h2 className="text-sm font-semibold text-foreground">Pacotes pendentes</h2>
                    {pendingPacks.length === 0 ? (
                        <div className="mt-3">
                            <EmptyState title="Nenhum pacote pendente." description="Participe de atividades, resgate códigos e conclua missões para receber novos pacotes." />
                        </div>
                    ) : (
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {pendingPacks.map((pack) => (
                                <Link key={pack.id} href={`/packs/${pack.id}`} className="collector-envelope group transition hover:-translate-y-0.5 motion-reduce:transform-none">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="collector-envelope__stamp">Pacote #{pack.id}</div>
                                            <div className="mt-1 text-lg font-semibold text-foreground">{pack.size} figurinhas</div>
                                        </div>
                                        <StatusBadge value={pack.status} />
                                    </div>
                                    <div className="mt-2 text-xs text-dim">{pack.album.name}</div>
                                    <div className="mt-2">
                                        <OriginBadge source={pack.source} label={sourceLabel(pack)} />
                                    </div>
                                    <div className="mt-3 inline-flex rounded-sm border border-primary/45 bg-card/80 px-2 py-1 text-[11px] font-semibold tracking-wide text-primary">
                                        Abrir pacote
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <DataTableShell title="Histórico de pacotes" subtitle="Origem, status e abertura para auditoria pessoal da temporada.">
                    <ResponsiveDataList
                        items={historyPacks.data}
                        getKey={(pack) => pack.id}
                        empty={<EmptyState title="Nenhum pacote encontrado." description="Seu histórico aparecerá aqui após as primeiras concessões." />}
                        renderItem={(pack) => (
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-mono text-xs text-dim">#{pack.id}</p>
                                        <p className="mt-1 text-sm font-semibold text-foreground">{pack.album.name}</p>
                                    </div>
                                    <StatusBadge value={pack.status} />
                                </div>
                                <div>
                                    <p className="responsive-data-key">Origem</p>
                                    <div className="mt-1"><OriginBadge source={pack.source} label={sourceLabel(pack)} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="responsive-data-key">Criado em</p>
                                        <p className="responsive-data-value">{fmtDateTimeBr(pack.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="responsive-data-key">Aberto em</p>
                                        <p className="responsive-data-value">{fmtDateTimeBr(pack.opened_at)}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Link href={`/packs/${pack.id}`} className="app-link-chip">Detalhes</Link>
                                    {pack.status === 'opened' ? (
                                        <PackShareButton pack={pack} userName={userName} className="app-link-chip" />
                                    ) : null}
                                    {can?.createShareCard && pack.status === 'opened' ? (
                                        <Link
                                            href="/share-cards"
                                            method="post"
                                            data={{ type: 'pack_opened', related_id: pack.id }}
                                            as="button"
                                            className="app-link-chip"
                                        >
                                            Gerar card
                                        </Link>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    />
                    <table className="hidden min-w-full text-sm md:table">
                        <thead>
                            <tr className="border-b border-border text-left">
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
                                    <tr key={pack.id} className="admin-table-row">
                                        <td className="px-4 py-2 font-mono text-xs text-dim">#{pack.id}</td>
                                        <td className="px-4 py-2 text-foreground">{pack.album.name}</td>
                                        <td className="px-4 py-2"><OriginBadge source={pack.source} label={sourceLabel(pack)} /></td>
                                        <td className="px-4 py-2"><StatusBadge value={pack.status} /></td>
                                        <td className="px-4 py-2 text-dim">{pack.size}</td>
                                        <td className="px-4 py-2 text-dim">{fmtDateTimeBr(pack.created_at)}</td>
                                        <td className="px-4 py-2 text-dim">{fmtDateTimeBr(pack.opened_at)}</td>
                                        <td className="space-x-2 px-4 py-2">
                                            <Link href={`/packs/${pack.id}`} className="text-xs underline">Detalhes</Link>
                                            {pack.status === 'opened' ? (
                                                <PackShareButton pack={pack} userName={userName} className="text-xs underline" />
                                            ) : null}
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

            <PageTour tourKey="packs-index" steps={TOUR_STEPS} />
        </>
    );
}
