import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { PaginationLinks } from '@/components/ui/pagination-links';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricCard } from '@/components/ui/metric-card';
import { PageHeader } from '@/components/ui/page-header';
import { ResponsiveDataList } from '@/components/ui/responsive-data-list';
import { StatusBadge } from '@/components/ui/status-badge';

type RewardCodeRow = {
    id: number;
    code: string;
    title: string;
    status: string;
    source_channel: string;
    reward_pack_quantity: number;
    reward_pack_size: number;
    starts_at: string | null;
    expires_at: string | null;
    redeemed_count: number;
    max_total_redemptions: number | null;
    album: { id: number; name: string; slug: string };
};

type PaginationLink = { url: string | null; label: string; active: boolean };

type Props = {
    rewardCodes: { data: RewardCodeRow[]; links: PaginationLink[] };
    filters: { search: string; status: string; source_channel: string; album_id: number | null };
    statuses: string[];
    channels: string[];
    albums: { id: number; name: string }[];
};

export default function AdminRewardCodesIndex({ rewardCodes, filters, statuses, channels, albums }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [channel, setChannel] = useState(filters.source_channel ?? '');
    const [albumId, setAlbumId] = useState(filters.album_id ? String(filters.album_id) : '');

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get('/admin/reward-codes', {
            search,
            status,
            source_channel: channel,
            album_id: albumId,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const activeCount = rewardCodes.data.filter((code) => code.status === 'active').length;

    return (
        <>
            <Head title="Códigos Promocionais" />
            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Códigos Promocionais"
                    subtitle="Operação de campanhas de resgate para Instagram, eventos e ativações do time."
                    actions={<Link href="/admin/reward-codes/create" className="rounded-sm border border-primary bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Novo código</Link>}
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard label="Códigos na listagem" value={rewardCodes.data.length} />
                    <MetricCard label="Códigos ativos" value={activeCount} accent={activeCount > 0 ? 'success' : 'default'} />
                    <MetricCard label="Canal Instagram" value={rewardCodes.data.filter((item) => item.source_channel === 'instagram').length} />
                    <MetricCard label="Resgates somados" value={rewardCodes.data.reduce((acc, item) => acc + item.redeemed_count, 0)} />
                </div>

                <form onSubmit={submit} className="album-paper grid gap-3 p-4 md:grid-cols-4">
                    <div>
                        <label className="text-xs font-semibold tracking-[0.1em] text-dim uppercase">Busca</label>
                        <input value={search} onChange={(event) => setSearch(event.target.value)} className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" placeholder="Código ou título" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold tracking-[0.1em] text-dim uppercase">Status</label>
                        <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm">
                            <option value="">Todos</option>
                            {statuses.map((item) => (<option key={item} value={item}>{item}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold tracking-[0.1em] text-dim uppercase">Canal</label>
                        <select value={channel} onChange={(event) => setChannel(event.target.value)} className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm">
                            <option value="">Todos</option>
                            {channels.map((item) => (<option key={item} value={item}>{item}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold tracking-[0.1em] text-dim uppercase">Álbum</label>
                        <select value={albumId} onChange={(event) => setAlbumId(event.target.value)} className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm">
                            <option value="">Todos</option>
                            {albums.map((album) => (<option key={album.id} value={album.id}>{album.name}</option>))}
                        </select>
                    </div>
                    <div className="md:col-span-4 flex justify-end">
                        <button type="submit" className="cursor-pointer rounded-sm border border-primary bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110">Filtrar</button>
                    </div>
                </form>

                <DataTableShell title="Códigos cadastrados" subtitle="Período, limite e consumo de resgates por álbum.">
                    <ResponsiveDataList
                        items={rewardCodes.data}
                        getKey={(code) => code.id}
                        empty={<EmptyState title="Nenhum código encontrado." />}
                        renderItem={(code) => (
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-foreground">{code.title}</p>
                                        <p className="mt-1 font-mono text-xs text-dim">{code.code}</p>
                                    </div>
                                    <StatusBadge value={code.status} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="responsive-data-key">Canal</p>
                                        <p className="responsive-data-value">{code.source_channel}</p>
                                    </div>
                                    <div>
                                        <p className="responsive-data-key">Álbum</p>
                                        <p className="responsive-data-value">{code.album.name}</p>
                                    </div>
                                    <div>
                                        <p className="responsive-data-key">Recompensa</p>
                                        <p className="responsive-data-value">{code.reward_pack_quantity}x{code.reward_pack_size}</p>
                                    </div>
                                    <div>
                                        <p className="responsive-data-key">Resgates</p>
                                        <p className="responsive-data-value">{code.redeemed_count}{code.max_total_redemptions ? `/${code.max_total_redemptions}` : ''}</p>
                                    </div>
                                </div>
                                <div className="pt-1">
                                    <Link href={`/admin/reward-codes/${code.id}`} className="app-link-chip">Detalhes</Link>
                                </div>
                            </div>
                        )}
                    />
                    <table className="hidden min-w-full text-sm md:table">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="px-4 py-2">Código</th>
                                <th className="px-4 py-2">Título</th>
                                <th className="px-4 py-2">Canal</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Recompensa</th>
                                <th className="px-4 py-2">Álbum</th>
                                <th className="px-4 py-2">Resgates</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rewardCodes.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8">
                                        <EmptyState title="Nenhum código encontrado." />
                                    </td>
                                </tr>
                            ) : (
                                rewardCodes.data.map((code) => (
                                    <tr key={code.id} className="admin-table-row">
                                        <td className="px-4 py-2 font-mono text-xs text-dim">{code.code}</td>
                                        <td className="px-4 py-2 text-foreground">{code.title}</td>
                                        <td className="px-4 py-2 text-dim">{code.source_channel}</td>
                                        <td className="px-4 py-2"><StatusBadge value={code.status} /></td>
                                        <td className="px-4 py-2 text-dim">{code.reward_pack_quantity}x{code.reward_pack_size}</td>
                                        <td className="px-4 py-2 text-dim">{code.album.name}</td>
                                        <td className="px-4 py-2 text-dim">{code.redeemed_count}{code.max_total_redemptions ? `/${code.max_total_redemptions}` : ''}</td>
                                        <td className="px-4 py-2">
                                            <Link href={`/admin/reward-codes/${code.id}`} className="text-xs underline">Detalhes</Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTableShell>

                <PaginationLinks links={rewardCodes.links} preserveState />
            </div>
        </>
    );
}
