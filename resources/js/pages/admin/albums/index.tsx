import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { PageHeader } from '@/components/ui/page-header';
import { ResponsiveDataList } from '@/components/ui/responsive-data-list';
import { StatusBadge } from '@/components/ui/status-badge';

type Team = { id: number; name: string; slug?: string };

type Album = {
    id: number;
    name: string;
    season: string | null;
    status: string;
    stickers_count: number;
    published_at: string | null;
    team: Team | null;
    teams: Team[];
};

type LinkItem = { url: string | null; label: string; active: boolean };

type Props = {
    albums: { data: Album[]; links: LinkItem[] };
    filters: { search: string; team_id: number | null; status: string };
    teams: Team[];
    statuses: string[];
};

export default function AlbumsIndex({ albums, filters, teams, statuses }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [teamId, setTeamId] = useState<string>(filters.team_id ? String(filters.team_id) : '');
    const [status, setStatus] = useState(filters.status ?? '');

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get('/admin/albums', { search, team_id: teamId, status }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Álbuns" />
            <div className="brand-app-bg space-y-4 p-4">
                <PageHeader
                    title="Álbuns"
                    subtitle="Catálogo de temporada, publicação e monitoramento de figurinhas por álbum."
                    actions={<Link href="/admin/albums/create" className="rounded-sm border border-primary bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Novo álbum</Link>}
                />

                <form onSubmit={submit} className="album-paper grid gap-3 p-4 md:grid-cols-5">
                    <div className="md:col-span-2">
                        <label className="text-xs font-semibold tracking-[0.1em] text-dim uppercase">Busca</label>
                        <input className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={search} onChange={(event) => setSearch(event.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold tracking-[0.1em] text-dim uppercase">Time</label>
                        <select className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={teamId} onChange={(event) => setTeamId(event.target.value)}>
                            <option value="">Todos</option>
                            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold tracking-[0.1em] text-dim uppercase">Status</label>
                        <select className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
                            <option value="">Todos</option>
                            {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end"><button className="w-full rounded-sm border border-primary bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground" type="submit">Filtrar</button></div>
                </form>

                <DataTableShell title="Álbuns cadastrados" subtitle="Times vinculados, status de publicação e volume de figurinhas.">
                    <ResponsiveDataList
                        items={albums.data}
                        getKey={(album) => album.id}
                        empty={<div className="rounded-md border border-dashed border-border bg-muted/60 p-6 text-center text-sm text-dim">Nenhum álbum encontrado.</div>}
                        renderItem={(album) => (
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground">{album.name}</p>
                                        <p className="mt-1 text-xs text-dim">{album.season ?? '-'}</p>
                                    </div>
                                    <StatusBadge value={album.status} />
                                </div>
                                <div>
                                    <p className="responsive-data-key">Times</p>
                                    <p className="responsive-data-value">
                                        {album.teams.length > 0
                                            ? album.teams.map((team) => team.name).join(', ')
                                            : (album.team?.name ?? '-')}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="responsive-data-key">Figurinhas</p>
                                        <p className="responsive-data-value">{album.stickers_count}</p>
                                    </div>
                                    <div>
                                        <p className="responsive-data-key">Publicado em</p>
                                        <p className="responsive-data-value">{album.published_at ?? '-'}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Link href={`/admin/albums/${album.id}`} className="app-link-chip">Ver</Link>
                                    <Link href={`/admin/albums/${album.id}/edit`} className="app-link-chip">Editar</Link>
                                    <button type="button" className="app-link-chip" onClick={() => router.patch(`/admin/albums/${album.id}/publish`)}>Publicar</button>
                                    <button type="button" className="app-link-chip" onClick={() => router.patch(`/admin/albums/${album.id}/archive`)}>Arquivar</button>
                                </div>
                            </div>
                        )}
                    />
                    <table className="hidden min-w-full text-sm md:table">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="px-4 py-2">Nome</th>
                                <th className="px-4 py-2">Time(s)</th>
                                <th className="px-4 py-2">Temporada</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Figurinhas</th>
                                <th className="px-4 py-2">Publicado em</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {albums.data.map((album) => (
                                <tr key={album.id} className="admin-table-row">
                                    <td className="px-4 py-2 text-foreground">{album.name}</td>
                                    <td className="px-4 py-2 text-dim">
                                        {album.teams.length > 0
                                            ? album.teams.map((team) => team.name).join(', ')
                                            : (album.team?.name ?? '-')}
                                    </td>
                                    <td className="px-4 py-2 text-dim">{album.season ?? '-'}</td>
                                    <td className="px-4 py-2"><StatusBadge value={album.status} /></td>
                                    <td className="px-4 py-2 text-dim">{album.stickers_count}</td>
                                    <td className="px-4 py-2 text-dim">{album.published_at ?? '-'}</td>
                                    <td className="space-x-2 px-4 py-2">
                                        <Link href={`/admin/albums/${album.id}`} className="text-xs underline">Ver</Link>
                                        <Link href={`/admin/albums/${album.id}/edit`} className="text-xs underline">Editar</Link>
                                        <button type="button" className="text-xs underline" onClick={() => router.patch(`/admin/albums/${album.id}/publish`)}>Publicar</button>
                                        <button type="button" className="text-xs underline" onClick={() => router.patch(`/admin/albums/${album.id}/archive`)}>Arquivar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </DataTableShell>

                <div className="flex flex-wrap gap-2">
                    {albums.links.map((link, index) => (
                        <button
                            key={`${link.label}-${index}`}
                            type="button"
                            onClick={() => link.url && router.visit(link.url)}
                            disabled={!link.url}
                            className={`rounded-sm border px-2 py-1 text-xs font-semibold ${link.active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground'}`}
                        >
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
