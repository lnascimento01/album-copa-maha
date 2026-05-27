import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';

type Mission = {
    id: number;
    title: string;
    slug: string;
    type: string;
    status: string;
    reward_pack_quantity: number;
    reward_pack_size: number;
    starts_at: string | null;
    ends_at: string | null;
    submissions_pending_count: number;
    submissions_approved_count: number;
    team: { id: number; name: string };
    album: { id: number; name: string };
};

type PaginationLink = { url: string | null; label: string; active: boolean };

type Props = {
    missions: { data: Mission[]; links: PaginationLink[] };
    filters: { search: string; status: string; type: string; team_id: number | null; album_id: number | null };
    statuses: string[];
    types: string[];
    teams: { id: number; name: string }[];
    albums: { id: number; name: string }[];
};

export default function AdminSocialMissionsIndex({ missions, filters, statuses, types, teams, albums }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [type, setType] = useState(filters.type ?? '');
    const [teamId, setTeamId] = useState(filters.team_id ? String(filters.team_id) : '');
    const [albumId, setAlbumId] = useState(filters.album_id ? String(filters.album_id) : '');

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get('/admin/social-missions', {
            search,
            status,
            type,
            team_id: teamId,
            album_id: albumId,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Missões Sociais" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-2">
                    <h1 className="text-xl font-semibold tracking-tight">Missões Sociais</h1>
                    <Link href="/admin/social-missions/create" className="rounded-sm border bg-black px-3 py-2 text-xs text-white">Nova missão</Link>
                </div>

                <form onSubmit={submit} className="grid gap-3 rounded-sm border p-4 md:grid-cols-5">
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Busca</label>
                        <input value={search} onChange={(event) => setSearch(event.target.value)} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" placeholder="Título ou slug" />
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Status</label>
                        <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm">
                            <option value="">Todos</option>
                            {statuses.map((item) => (<option key={item} value={item}>{item}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Tipo</label>
                        <select value={type} onChange={(event) => setType(event.target.value)} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm">
                            <option value="">Todos</option>
                            {types.map((item) => (<option key={item} value={item}>{item}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Time</label>
                        <select value={teamId} onChange={(event) => setTeamId(event.target.value)} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm">
                            <option value="">Todos</option>
                            {teams.map((team) => (<option key={team.id} value={team.id}>{team.name}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Álbum</label>
                        <select value={albumId} onChange={(event) => setAlbumId(event.target.value)} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm">
                            <option value="">Todos</option>
                            {albums.map((album) => (<option key={album.id} value={album.id}>{album.name}</option>))}
                        </select>
                    </div>
                    <div className="md:col-span-5 flex justify-end">
                        <button type="submit" className="rounded-sm border bg-black px-3 py-2 text-sm text-white">Filtrar</button>
                    </div>
                </form>

                <div className="overflow-x-auto rounded-sm border">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="px-4 py-2">Título</th>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Recompensa</th>
                                <th className="px-4 py-2">Pendentes</th>
                                <th className="px-4 py-2">Aprovadas</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {missions.data.map((mission) => (
                                <tr key={mission.id} className="border-b">
                                    <td className="px-4 py-2">{mission.title}</td>
                                    <td className="px-4 py-2">{mission.type}</td>
                                    <td className="px-4 py-2">{mission.status}</td>
                                    <td className="px-4 py-2">{mission.reward_pack_quantity}x{mission.reward_pack_size}</td>
                                    <td className="px-4 py-2">{mission.submissions_pending_count}</td>
                                    <td className="px-4 py-2">{mission.submissions_approved_count}</td>
                                    <td className="px-4 py-2"><Link href={`/admin/social-missions/${mission.id}`} className="text-xs underline">Detalhes</Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap gap-2">
                    {missions.links.map((link, index) => (
                        <button key={`${link.label}-${index}`} type="button" onClick={() => link.url && router.visit(link.url)} disabled={!link.url} className={`rounded-sm border px-2 py-1 text-xs ${link.active ? 'bg-black text-white' : ''}`}>
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
