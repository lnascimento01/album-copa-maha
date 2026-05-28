import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';

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
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-xl font-semibold tracking-tight">Álbuns</h1>
                    <Link href="/admin/albums/create" className="rounded-sm border bg-black px-3 py-2 text-xs text-white">Novo álbum</Link>
                </div>

                <form onSubmit={submit} className="grid gap-3 rounded-sm border p-4 md:grid-cols-5">
                    <div className="md:col-span-2">
                        <label className="text-xs uppercase text-muted-foreground">Busca</label>
                        <input className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={search} onChange={(event) => setSearch(event.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Time</label>
                        <select className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={teamId} onChange={(event) => setTeamId(event.target.value)}>
                            <option value="">Todos</option>
                            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Status</label>
                        <select className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
                            <option value="">Todos</option>
                            {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end"><button className="w-full rounded-sm border bg-black px-3 py-2 text-sm text-white" type="submit">Filtrar</button></div>
                </form>

                <div className="overflow-x-auto rounded-sm border">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="px-4 py-2">Nome</th>
                                <th className="px-4 py-2">Time</th>
                                <th className="px-4 py-2">Temporada</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Figurinhas</th>
                                <th className="px-4 py-2">Publicado em</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {albums.data.map((album) => (
                                <tr key={album.id} className="border-b">
                                    <td className="px-4 py-2">{album.name}</td>
                                    <td className="px-4 py-2">
                                        {album.teams.length > 0
                                            ? album.teams.map((team) => team.name).join(', ')
                                            : (album.team?.name ?? '-')}
                                    </td>
                                    <td className="px-4 py-2">{album.season ?? '-'}</td>
                                    <td className="px-4 py-2">{album.status}</td>
                                    <td className="px-4 py-2">{album.stickers_count}</td>
                                    <td className="px-4 py-2">{album.published_at ?? '-'}</td>
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
                </div>

                <div className="flex flex-wrap gap-2">
                    {albums.links.map((link, index) => (
                        <button
                            key={`${link.label}-${index}`}
                            type="button"
                            onClick={() => link.url && router.visit(link.url)}
                            disabled={!link.url}
                            className={`rounded-sm border px-2 py-1 text-xs ${link.active ? 'bg-black text-white' : ''}`}
                        >
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
