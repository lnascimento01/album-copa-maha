import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';

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

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get('/admin/teams', { search, is_active: isActive }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Times" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-xl font-semibold tracking-tight">Times</h1>
                    <Link href="/admin/teams/create" className="rounded-sm border bg-primary px-3 py-2 text-xs text-primary-foreground">Novo time</Link>
                </div>

                <form onSubmit={submit} className="grid gap-3 rounded-sm border p-4 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <label className="text-xs uppercase text-muted-foreground">Busca</label>
                        <input className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome, slug ou sigla" />
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Ativo</label>
                        <select className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={isActive} onChange={(event) => setIsActive(event.target.value)}>
                            <option value="">Todos</option>
                            <option value="1">Sim</option>
                            <option value="0">Não</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button className="w-full rounded-sm border bg-primary px-3 py-2 text-sm text-primary-foreground" type="submit">Filtrar</button>
                    </div>
                </form>

                <div className="overflow-x-auto rounded-sm border">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="px-4 py-2">Nome</th>
                                <th className="px-4 py-2">Slug</th>
                                <th className="px-4 py-2">Sigla</th>
                                <th className="px-4 py-2">Ativo</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.data.map((team) => (
                                <tr key={team.id} className="border-b">
                                    <td className="px-4 py-2">{team.name}</td>
                                    <td className="px-4 py-2 font-mono text-xs">{team.slug}</td>
                                    <td className="px-4 py-2">{team.short_name ?? '-'}</td>
                                    <td className="px-4 py-2">{team.is_active ? 'Sim' : 'Não'}</td>
                                    <td className="space-x-2 px-4 py-2">
                                        <Link href={`/admin/teams/${team.id}`} className="text-xs underline">Ver</Link>
                                        <Link href={`/admin/teams/${team.id}/edit`} className="text-xs underline">Editar</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap gap-2">
                    {teams.links.map((link, index) => (
                        <button
                            key={`${link.label}-${index}`}
                            type="button"
                            onClick={() => link.url && router.visit(link.url)}
                            disabled={!link.url}
                            className={`rounded-sm border px-2 py-1 text-xs ${link.active ? 'bg-primary text-primary-foreground' : ''}`}
                        >
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
