import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { PaginationLinks } from '@/components/ui/pagination-links';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricCard } from '@/components/ui/metric-card';
import { PageHeader } from '@/components/ui/page-header';
import { ResponsiveDataList } from '@/components/ui/responsive-data-list';
import { StatusBadge } from '@/components/ui/status-badge';

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

    const activeCount = useMemo(() => players.data.filter((player) => player.is_active).length, [players.data]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get('/admin/players', { search, team_id: teamId, type, is_active: isActive }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Jogadores" />
            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Jogadores e personagens"
                    subtitle="Gestão operacional do elenco e cards que compõem as páginas do álbum AAPH."
                    actions={<Link href="/admin/players/create" className="rounded-sm border border-primary bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Novo registro</Link>}
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard label="Registros na listagem" value={players.data.length} />
                    <MetricCard label="Ativos" value={activeCount} accent={activeCount > 0 ? 'success' : 'default'} />
                    <MetricCard label="Inativos" value={Math.max(players.data.length - activeCount, 0)} accent={players.data.length - activeCount > 0 ? 'warning' : 'default'} />
                    <MetricCard label="Times com atletas" value={new Set(players.data.map((item) => item.team.id)).size} />
                </div>

                <section className="admin-strip">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-semibold tracking-[0.14em] text-dim uppercase">Curadoria de temporada</p>
                            <p className="mt-1 text-sm text-foreground">Ajuste posição, tipo e status dos atletas para refletir a composição oficial da Copa AAPH.</p>
                        </div>
                        <span className="brand-pill">Catálogo de elenco</span>
                    </div>
                </section>

                <form onSubmit={submit} className="admin-filter-grid md:grid-cols-5">
                    <div className="md:col-span-2">
                        <label className="admin-filter-label">Busca</label>
                        <input className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome, apelido ou número" />
                    </div>
                    <div>
                        <label className="admin-filter-label">Tipo</label>
                        <select className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={type} onChange={(event) => setType(event.target.value)}>
                            <option value="">Todos</option>
                            {types.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="admin-filter-label">Time</label>
                        <select className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={teamId} onChange={(event) => setTeamId(event.target.value)}>
                            <option value="">Todos</option>
                            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="admin-filter-label">Status</label>
                        <select className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={isActive} onChange={(event) => setIsActive(event.target.value)}>
                            <option value="">Todos</option>
                            <option value="1">Ativo</option>
                            <option value="0">Inativo</option>
                        </select>
                    </div>
                    <div className="md:col-span-5 flex justify-end">
                        <button className="cursor-pointer rounded-sm border border-primary bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110" type="submit">Filtrar</button>
                    </div>
                </form>

                <DataTableShell title="Elenco cadastrado" subtitle="Controle de atletas e personagens usados nas figurinhas da temporada.">
                    <ResponsiveDataList
                        items={players.data}
                        getKey={(player) => player.id}
                        empty={<EmptyState title="Nenhum jogador encontrado." description="Cadastre atletas para iniciar o catálogo de figurinhas do álbum." />}
                        renderItem={(player) => (
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground">{player.name}</p>
                                        <p className="mt-1 text-xs text-dim">{player.team.name}</p>
                                    </div>
                                    <StatusBadge value={player.is_active ? 'active' : 'inactive'} label={player.is_active ? 'Ativo' : 'Inativo'} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="responsive-data-key">Apelido</p>
                                        <p className="responsive-data-value">{player.nickname ?? '-'}</p>
                                    </div>
                                    <div>
                                        <p className="responsive-data-key">Nº camisa</p>
                                        <p className="responsive-data-value">{player.shirt_number ?? '-'}</p>
                                    </div>
                                    <div>
                                        <p className="responsive-data-key">Posição</p>
                                        <p className="responsive-data-value">{player.position ?? '-'}</p>
                                    </div>
                                    <div>
                                        <p className="responsive-data-key">Tipo</p>
                                        <p className="responsive-data-value">{player.type}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Link href={`/admin/players/${player.id}`} className="app-link-chip">Ver</Link>
                                    <Link href={`/admin/players/${player.id}/edit`} className="app-link-chip">Editar</Link>
                                </div>
                            </div>
                        )}
                    />
                    <table className="hidden min-w-full text-sm md:table">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="px-4 py-2">Nome</th>
                                <th className="px-4 py-2">Apelido</th>
                                <th className="px-4 py-2">Número</th>
                                <th className="px-4 py-2">Posição</th>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Time</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8">
                                        <EmptyState title="Nenhum jogador encontrado." description="Cadastre atletas para iniciar o catálogo de figurinhas do álbum." />
                                    </td>
                                </tr>
                            ) : (
                                players.data.map((player) => (
                                    <tr key={player.id} className="admin-table-row">
                                        <td className="px-4 py-2 font-medium text-foreground">{player.name}</td>
                                        <td className="px-4 py-2 text-dim">{player.nickname ?? '-'}</td>
                                        <td className="px-4 py-2 text-dim">{player.shirt_number ?? '-'}</td>
                                        <td className="px-4 py-2 text-dim">{player.position ?? '-'}</td>
                                        <td className="px-4 py-2 text-dim">{player.type}</td>
                                        <td className="px-4 py-2 text-dim">{player.team.name}</td>
                                        <td className="px-4 py-2"><StatusBadge value={player.is_active ? 'active' : 'inactive'} label={player.is_active ? 'Ativo' : 'Inativo'} /></td>
                                        <td className="space-x-2 px-4 py-2">
                                            <Link href={`/admin/players/${player.id}`} className="text-xs underline">Ver</Link>
                                            <Link href={`/admin/players/${player.id}/edit`} className="text-xs underline">Editar</Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTableShell>

                <PaginationLinks links={players.links} preserveState />
            </div>
        </>
    );
}
