import { Head, Link, router } from '@inertiajs/react';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { OriginBadge } from '@/components/ui/origin-badge';
import { PageHeader } from '@/components/ui/page-header';
import { ResponsiveDataList } from '@/components/ui/responsive-data-list';
import { StatusBadge } from '@/components/ui/status-badge';

type LinkItem = { url: string | null; label: string; active: boolean };

type Checkin = {
    id: number;
    status: string;
    checked_at: string | null;
    revoked_at: string | null;
    sticker_packs_count: number;
    source: 'admin' | 'self' | 'event';
    activity: {
        id: number;
        title: string;
        type: string;
        status: string;
        starts_at: string | null;
        team: { id: number; name: string };
        album: { id: number; name: string };
    };
};

export default function CheckinsIndex({ checkins }: { checkins: { data: Checkin[]; links: LinkItem[] } }) {
    return (
        <>
            <Head title="Meus Check-ins" />
            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Meus check-ins"
                    subtitle="Histórico de presenças confirmadas por administração ou autoatendimento via QR/código."
                    actions={<Link href="/packs" className="rounded-sm border border-border bg-card px-3 py-2 text-xs font-semibold">Ver pacotes</Link>}
                />

                <section className="campaign-panel">
                    <p className="text-[10px] font-semibold tracking-[0.14em] text-[color:var(--info-soft-text)] uppercase">Linha da temporada</p>
                    <p className="mt-1 text-sm text-[color:var(--info-soft-text)]">Cada presença confirmada pode virar pacote e acelerar seu progresso no álbum oficial.</p>
                </section>

                <DataTableShell title="Histórico de presença" subtitle="Acompanhe origem do check-in, data e quantidade de pacotes gerados.">
                    <ResponsiveDataList
                        items={checkins.data}
                        getKey={(checkin) => checkin.id}
                        empty={<EmptyState title="Nenhum check-in confirmado." description="Participe das atividades abertas para iniciar seu histórico." />}
                        renderItem={(checkin) => (
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground">{checkin.activity.title}</p>
                                        <p className="mt-1 text-xs text-dim">{checkin.activity.type}</p>
                                    </div>
                                    <StatusBadge value={checkin.status} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="responsive-data-key">Origem</p>
                                        <div className="mt-1">
                                            {checkin.source === 'self' ? (
                                                <OriginBadge source="checkin" label="QR/Código" />
                                            ) : checkin.source === 'event' ? (
                                                <OriginBadge source="event_geolocation" label="Geolocalização" />
                                            ) : (
                                                <OriginBadge source="admin" label="Administração" />
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="responsive-data-key">Pacotes</p>
                                        <p className="responsive-data-value">{checkin.sticker_packs_count}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="responsive-data-key">Data</p>
                                        <p className="responsive-data-value">{checkin.checked_at ?? '-'}</p>
                                    </div>
                                </div>
                                <div className="pt-1">
                                    <Link href={`/checkins/${checkin.id}`} className="app-link-chip">Detalhes</Link>
                                </div>
                            </div>
                        )}
                    />
                    <table className="hidden min-w-full text-sm md:table">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="px-4 py-2">Atividade</th>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Origem</th>
                                <th className="px-4 py-2">Data</th>
                                <th className="px-4 py-2">Pacotes</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {checkins.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8">
                                        <EmptyState title="Nenhum check-in confirmado." description="Participe das atividades abertas para iniciar seu histórico." />
                                    </td>
                                </tr>
                            ) : (
                                checkins.data.map((checkin) => (
                                    <tr key={checkin.id} className="admin-table-row">
                                        <td className="px-4 py-2 text-foreground">{checkin.activity.title}</td>
                                        <td className="px-4 py-2 text-dim">{checkin.activity.type}</td>
                                        <td className="px-4 py-2"><StatusBadge value={checkin.status} /></td>
                                        <td className="px-4 py-2">
                                            {checkin.source === 'self' ? (
                                                <OriginBadge source="checkin" label="QR/Código" />
                                            ) : checkin.source === 'event' ? (
                                                <OriginBadge source="event_geolocation" label="Geolocalização" />
                                            ) : (
                                                <OriginBadge source="admin" label="Administração" />
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-dim">{checkin.checked_at ?? '-'}</td>
                                        <td className="px-4 py-2 text-dim">{checkin.sticker_packs_count}</td>
                                        <td className="px-4 py-2">
                                            <Link href={`/checkins/${checkin.id}`} className="text-xs underline">Detalhes</Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTableShell>

                <div className="flex flex-wrap gap-2">
                    {checkins.links.map((link, index) => (
                        <button
                            key={`${link.label}-${index}`}
                            type="button"
                            onClick={() => link.url && router.visit(link.url)}
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
