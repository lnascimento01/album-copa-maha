import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricCard } from '@/components/ui/metric-card';
import { PageHeader } from '@/components/ui/page-header';
import { ResponsiveDataList } from '@/components/ui/responsive-data-list';
import { StatusBadge } from '@/components/ui/status-badge';

type Team = {
    id: number;
    name: string;
    slug: string;
    short_name: string | null;
    is_active: boolean;
};

type LinkItem = { url: string | null; label: string; active: boolean };

type Props = {
    teams: { data: Team[]; links: LinkItem[] };
    filters: { search: string; is_active: string };
};

export default function TeamsIndex({ teams, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [isActive, setIsActive] = useState(filters.is_active ?? '');

    const activeCount = useMemo(() => teams.data.filter((team) => team.is_active).length, [teams.data]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get('/admin/teams', { search, is_active: isActive }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Times" />
            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Times"
                    subtitle="Base de equipes da Copa AAPH para montagem de álbuns, figurinhas e campanhas."
                    actions={(
                        <Link href="/admin/teams/create" className="rounded-sm border border-primary bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                            Novo time
                        </Link>
                    )}
                />

                <div className="grid gap-3 sm:grid-cols-3">
                    <MetricCard label="Times listados" value={teams.data.length} />
                    <MetricCard label="Times ativos" value={activeCount} accent={activeCount > 0 ? 'success' : 'default'} />
                    <MetricCard label="Times inativos" value={Math.max(teams.data.length - activeCount, 0)} accent={teams.data.length - activeCount > 0 ? 'warning' : 'default'} />
                </div>

                <section className="admin-strip">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-semibold tracking-[0.14em] text-dim uppercase">Operação de catálogo</p>
                            <p className="mt-1 text-sm text-foreground">Mantenha nomes, siglas e status dos times alinhados com a temporada ativa.</p>
                        </div>
                        <span className="brand-pill">Administração AAPH</span>
                    </div>
                </section>

                <form onSubmit={submit} className="admin-filter-grid md:grid-cols-4">
                    <div className="md:col-span-2">
                        <label className="admin-filter-label">Busca</label>
                        <input
                            className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Nome, slug ou sigla"
                        />
                    </div>
                    <div>
                        <label className="admin-filter-label">Status</label>
                        <select className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={isActive} onChange={(event) => setIsActive(event.target.value)}>
                            <option value="">Todos</option>
                            <option value="1">Ativo</option>
                            <option value="0">Inativo</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button className="cursor-pointer w-full rounded-sm border border-primary bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110" type="submit">
                            Filtrar
                        </button>
                    </div>
                </form>

                <DataTableShell title="Times cadastrados" subtitle="Estrutura de equipes usada em álbuns, jogadores e figurinhas.">
                    <ResponsiveDataList
                        items={teams.data}
                        getKey={(team) => team.id}
                        empty={<EmptyState title="Nenhum time encontrado." description="Ajuste os filtros ou cadastre um novo time para iniciar a temporada." />}
                        renderItem={(team) => (
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground">{team.name}</p>
                                        <p className="mt-1 font-mono text-xs text-dim">{team.slug}</p>
                                    </div>
                                    <StatusBadge value={team.is_active ? 'active' : 'inactive'} label={team.is_active ? 'Ativo' : 'Inativo'} />
                                </div>
                                <div>
                                    <p className="responsive-data-key">Sigla</p>
                                    <p className="responsive-data-value">{team.short_name ?? '-'}</p>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Link href={`/admin/teams/${team.id}`} className="app-link-chip">Ver</Link>
                                    <Link href={`/admin/teams/${team.id}/edit`} className="app-link-chip">Editar</Link>
                                </div>
                            </div>
                        )}
                    />
                    <table className="hidden min-w-full text-sm md:table">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="px-4 py-2">Nome</th>
                                <th className="px-4 py-2">Slug</th>
                                <th className="px-4 py-2">Sigla</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8">
                                        <EmptyState title="Nenhum time encontrado." description="Ajuste os filtros ou cadastre um novo time para iniciar a temporada." />
                                    </td>
                                </tr>
                            ) : (
                                teams.data.map((team) => (
                                    <tr key={team.id} className="admin-table-row">
                                        <td className="px-4 py-2 font-medium text-foreground">{team.name}</td>
                                        <td className="px-4 py-2 font-mono text-xs text-dim">{team.slug}</td>
                                        <td className="px-4 py-2 text-dim">{team.short_name ?? '-'}</td>
                                        <td className="px-4 py-2">
                                            <StatusBadge value={team.is_active ? 'active' : 'inactive'} label={team.is_active ? 'Ativo' : 'Inativo'} />
                                        </td>
                                        <td className="space-x-2 px-4 py-2">
                                            <Link href={`/admin/teams/${team.id}`} className="text-xs underline">Ver</Link>
                                            <Link href={`/admin/teams/${team.id}/edit`} className="text-xs underline">Editar</Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTableShell>

                <div className="flex flex-wrap gap-2">
                    {teams.links.map((link, index) => (
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
