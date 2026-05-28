import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';

type Team = { id: number; name: string };

type Player = {
    id: number;
    name: string;
    nickname: string | null;
    shirt_number: string | null;
    position: string | null;
    type: string;
    team: Team;
    is_active: boolean;
};

type LinkItem = { url: string | null; label: string; active: boolean };

type Props = {
    players: { data: Player[]; links: LinkItem[] };
    filters: { search: string; team_id: number | null; type: string; is_active: string };
    teams: Team[];
    types: string[];
};

export default function PlayersIndex({ players, filters, teams, types }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [teamId, setTeamId] = useState<string>(filters.team_id ? String(filters.team_id) : '');
    const [type, setType] = useState(filters.type ?? '');
    const [isActive, setIsActive] = useState(filters.is_active ?? '');

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get('/admin/players', { search, team_id: teamId, type, is_active: isActive }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Jogadores" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-xl font-semibold tracking-tight">Jogadores/Personagens</h1>
                    <Link href="/admin/players/create" className="rounded-sm border bg-primary px-3 py-2 text-xs text-primary-foreground">Novo</Link>
                </div>

                <form onSubmit={submit} className="grid gap-3 rounded-sm border p-4 md:grid-cols-5">
                    <div className="md:col-span-2">
                        <label className="text-xs uppercase text-muted-foreground">Busca</label>
                        <input className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={search} onChange={(event) => setSearch(event.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Tipo</label>
                        <select className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={type} onChange={(event) => setType(event.target.value)}>
                            <option value="">Todos</option>
                            {types.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Time</label>
                        <select className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={teamId} onChange={(event) => setTeamId(event.target.value)}>
                            <option value="">Todos</option>
                            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Ativo</label>
                        <select className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={isActive} onChange={(event) => setIsActive(event.target.value)}>
                            <option value="">Todos</option>
                            <option value="1">Sim</option>
                            <option value="0">Não</option>
                        </select>
                    </div>
                    <div className="md:col-span-5 flex justify-end">
                        <button className="rounded-sm border bg-primary px-3 py-2 text-sm text-primary-foreground" type="submit">Filtrar</button>
                    </div>
                </form>

                <div className="overflow-x-auto rounded-sm border">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="px-4 py-2">Nome</th>
                                <th className="px-4 py-2">Apelido</th>
                                <th className="px-4 py-2">Número</th>
                                <th className="px-4 py-2">Posição</th>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Time</th>
                                <th className="px-4 py-2">Ativo</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.data.map((player) => (
                                <tr key={player.id} className="border-b">
                                    <td className="px-4 py-2">{player.name}</td>
                                    <td className="px-4 py-2">{player.nickname ?? '-'}</td>
                                    <td className="px-4 py-2">{player.shirt_number ?? '-'}</td>
                                    <td className="px-4 py-2">{player.position ?? '-'}</td>
                                    <td className="px-4 py-2">{player.type}</td>
                                    <td className="px-4 py-2">{player.team.name}</td>
                                    <td className="px-4 py-2">{player.is_active ? 'Sim' : 'Não'}</td>
                                    <td className="space-x-2 px-4 py-2">
                                        <Link href={`/admin/players/${player.id}`} className="text-xs underline">Ver</Link>
                                        <Link href={`/admin/players/${player.id}/edit`} className="text-xs underline">Editar</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap gap-2">
                    {players.links.map((link, index) => (
                        <button key={`${link.label}-${index}`} type="button" onClick={() => link.url && router.visit(link.url)} disabled={!link.url} className={`rounded-sm border px-2 py-1 text-xs ${link.active ? 'bg-primary text-primary-foreground' : ''}`}>
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
