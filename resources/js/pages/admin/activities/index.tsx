import { Head, Link, router } from '@inertiajs/react';
import { PaginationLinks } from '@/components/ui/pagination-links';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { fmtDateTimeBr } from '@/lib/date';

type RefItem = { id: number; name: string };

type Activity = {
    id: number;
    title: string;
    slug: string;
    type: string;
    status: string;
    starts_at: string | null;
    reward_pack_quantity: number;
    reward_pack_size: number;
    checkins_count: number;
    sticker_packs_count: number;
    team: RefItem;
    album: RefItem;
};

type LinkItem = { url: string | null; label: string; active: boolean };

type Props = {
    activities: { data: Activity[]; links: LinkItem[] };
    filters: {
        search: string;
        status: string;
        type: string;
        team_id: number | null;
        album_id: number | null;
        date_from: string;
        date_to: string;
    };
    statuses: string[];
    types: string[];
    teams: RefItem[];
    albums: RefItem[];
};

export default function AdminActivitiesIndex({ activities, filters, statuses, types, teams, albums }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [type, setType] = useState(filters.type ?? '');
    const [teamId, setTeamId] = useState(filters.team_id ? String(filters.team_id) : '');
    const [albumId, setAlbumId] = useState(filters.album_id ? String(filters.album_id) : '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const submit = (event: FormEvent) => {
        event.preventDefault();

        router.get('/admin/activities', {
            search,
            status,
            type,
            team_id: teamId,
            album_id: albumId,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Atividades" />
            <div className="space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Atividades"
                    subtitle="Operação de presença, recompensa e check-ins por atividade."
                    actions={<Link href="/admin/activities/create" className="rounded-sm border bg-primary px-3 py-2 text-xs text-primary-foreground">Nova atividade</Link>}
                />

                <form onSubmit={submit} className="grid gap-3 rounded-md border border-border bg-card p-4 md:grid-cols-7">
                    <div className="md:col-span-2">
                        <label className="text-xs uppercase tracking-wide text-dim">Busca</label>
                        <input value={search} onChange={(event) => setSearch(event.target.value)} className="mt-1 w-full rounded-sm border border-input px-2 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Status</label>
                        <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 w-full rounded-sm border border-input px-2 py-2 text-sm">
                            <option value="">Todos</option>
                            {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Tipo</label>
                        <select value={type} onChange={(event) => setType(event.target.value)} className="mt-1 w-full rounded-sm border border-input px-2 py-2 text-sm">
                            <option value="">Todos</option>
                            {types.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Time</label>
                        <select value={teamId} onChange={(event) => setTeamId(event.target.value)} className="mt-1 w-full rounded-sm border border-input px-2 py-2 text-sm">
                            <option value="">Todos</option>
                            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Álbum</label>
                        <select value={albumId} onChange={(event) => setAlbumId(event.target.value)} className="mt-1 w-full rounded-sm border border-input px-2 py-2 text-sm">
                            <option value="">Todos</option>
                            {albums.map((album) => <option key={album.id} value={album.id}>{album.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Início (de)</label>
                        <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="mt-1 w-full rounded-sm border border-input px-2 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Início (até)</label>
                        <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="mt-1 w-full rounded-sm border border-input px-2 py-2 text-sm" />
                    </div>
                    <div className="md:col-span-7 flex justify-end">
                        <button className="cursor-pointer rounded-sm border bg-primary px-3 py-2 text-sm text-primary-foreground transition-all hover:brightness-110" type="submit">Filtrar</button>
                    </div>
                </form>

                <DataTableShell title="Atividades cadastradas" subtitle="Acompanhe status operacional, check-ins e pacotes gerados.">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="px-4 py-2">Título</th>
                                <th className="px-4 py-2">Time</th>
                                <th className="px-4 py-2">Álbum</th>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Início</th>
                                <th className="px-4 py-2">Recompensa</th>
                                <th className="px-4 py-2">Check-ins</th>
                                <th className="px-4 py-2">Pacotes</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.data.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-8">
                                        <EmptyState title="Nenhuma atividade encontrada." />
                                    </td>
                                </tr>
                            ) : (
                                activities.data.map((activity) => (
                                    <tr key={activity.id} className="border-b border-border/70">
                                        <td className="px-4 py-2 text-foreground">{activity.title}</td>
                                        <td className="px-4 py-2 text-dim">{activity.team.name}</td>
                                        <td className="px-4 py-2 text-dim">{activity.album.name}</td>
                                        <td className="px-4 py-2 text-dim">{activity.type}</td>
                                        <td className="px-4 py-2"><StatusBadge value={activity.status} /></td>
                                        <td className="px-4 py-2 text-dim">{fmtDateTimeBr(activity.starts_at)}</td>
                                        <td className="px-4 py-2 text-dim">{activity.reward_pack_quantity}x{activity.reward_pack_size}</td>
                                        <td className="px-4 py-2 text-dim">{activity.checkins_count}</td>
                                        <td className="px-4 py-2 text-dim">{activity.sticker_packs_count}</td>
                                        <td className="space-x-2 px-4 py-2">
                                            <Link href={`/admin/activities/${activity.id}`} className="text-xs underline">Ver</Link>
                                            <Link href={`/admin/activities/${activity.id}/edit`} className="text-xs underline">Editar</Link>
                                            <button type="button" className="text-xs underline" onClick={() => router.patch(`/admin/activities/${activity.id}/open`)}>Abrir</button>
                                            <button type="button" className="text-xs underline" onClick={() => router.patch(`/admin/activities/${activity.id}/close`)}>Fechar</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTableShell>

                <PaginationLinks links={activities.links} preserveState />
            </div>
        </>
    );
}
