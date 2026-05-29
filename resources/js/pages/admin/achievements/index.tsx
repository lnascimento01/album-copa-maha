import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';

type RefItem = { id: number; name: string };
type PaginationLink = { url: string | null; label: string; active: boolean };

type Row = {
    id: number;
    name: string;
    slug: string;
    type: string;
    threshold: number | null;
    is_active: boolean;
    sort_order: number;
    unlocked_count: number;
    team: RefItem | null;
    album: RefItem | null;
};

type Props = {
    achievements: { data: Row[]; links: PaginationLink[] };
    filters: {
        search: string;
        type: string;
        is_active: boolean | null;
        team_id: number | null;
        album_id: number | null;
    };
    types: string[];
    teams: RefItem[];
    albums: RefItem[];
};

export default function AdminAchievementsIndex({ achievements, filters, types, teams, albums }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [type, setType] = useState(filters.type ?? '');
    const [isActive, setIsActive] = useState(filters.is_active === null ? '' : (filters.is_active ? '1' : '0'));
    const [teamId, setTeamId] = useState(filters.team_id ? String(filters.team_id) : '');
    const [albumId, setAlbumId] = useState(filters.album_id ? String(filters.album_id) : '');

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get('/admin/achievements', {
            search,
            type,
            is_active: isActive,
            team_id: teamId,
            album_id: albumId,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Conquistas (Admin)" />
            <div className="space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Conquistas"
                    subtitle="Configuração de metas de engajamento e coleção da temporada."
                    actions={<Link href="/admin/achievements/create" className="rounded-sm border bg-primary px-3 py-2 text-xs text-primary-foreground">Nova conquista</Link>}
                />

                <form onSubmit={submit} className="grid gap-3 rounded-md border border-border bg-card p-4 md:grid-cols-5">
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Busca</label>
                        <input value={search} onChange={(event) => setSearch(event.target.value)} className="mt-1 w-full rounded-sm border border-input px-2 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Tipo</label>
                        <select value={type} onChange={(event) => setType(event.target.value)} className="mt-1 w-full rounded-sm border border-input px-2 py-2 text-sm">
                            <option value="">Todos</option>
                            {types.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Status</label>
                        <select value={isActive} onChange={(event) => setIsActive(event.target.value)} className="mt-1 w-full rounded-sm border border-input px-2 py-2 text-sm">
                            <option value="">Todos</option>
                            <option value="1">Ativa</option>
                            <option value="0">Inativa</option>
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
                    <div className="md:col-span-5 flex justify-end">
                        <button type="submit" className="rounded-sm border bg-primary px-3 py-2 text-sm text-primary-foreground">Filtrar</button>
                    </div>
                </form>

                <DataTableShell title="Conquistas cadastradas" subtitle="Escopo por time/álbum, threshold e volume de desbloqueios.">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="px-4 py-2">Nome</th>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Threshold</th>
                                <th className="px-4 py-2">Escopo</th>
                                <th className="px-4 py-2">Ativa</th>
                                <th className="px-4 py-2">Desbloqueios</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {achievements.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8">
                                        <EmptyState title="Nenhuma conquista encontrada." />
                                    </td>
                                </tr>
                            ) : (
                                achievements.data.map((item) => (
                                    <tr key={item.id} className="border-b border-border/70">
                                        <td className="px-4 py-2">
                                            <div className="font-medium text-foreground">{item.name}</div>
                                            <div className="font-mono text-[11px] text-dim">{item.slug}</div>
                                        </td>
                                        <td className="px-4 py-2 text-dim">{item.type}</td>
                                        <td className="px-4 py-2 text-dim">{item.threshold ?? '-'}</td>
                                        <td className="px-4 py-2 text-xs text-dim">{item.team?.name ?? 'Global'} / {item.album?.name ?? 'Global'}</td>
                                        <td className="px-4 py-2"><StatusBadge value={item.is_active ? 'active' : 'archived'} label={item.is_active ? 'Ativa' : 'Inativa'} /></td>
                                        <td className="px-4 py-2 text-dim">{item.unlocked_count}</td>
                                        <td className="space-x-2 px-4 py-2">
                                            <Link href={`/admin/achievements/${item.id}`} className="text-xs underline">Ver</Link>
                                            <Link href={`/admin/achievements/${item.id}/edit`} className="text-xs underline">Editar</Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTableShell>

                <div className="flex flex-wrap gap-2">
                    {achievements.links.map((link, index) => (
                        <button
                            key={`${link.label}-${index}`}
                            type="button"
                            onClick={() => link.url && router.visit(link.url)}
                            disabled={!link.url}
                            className={`rounded-sm border px-2 py-1 text-xs ${link.active ? 'bg-primary text-primary-foreground' : 'bg-card text-dim'}`}
                        >
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
