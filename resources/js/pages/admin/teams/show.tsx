import { Head, Link } from '@inertiajs/react';

type Team = {
    id: number;
    name: string;
    slug: string;
    short_name: string | null;
    description: string | null;
    logo_path: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    is_active: boolean;
    albums_count: number;
    players_count: number;
    created_at: string | null;
    updated_at: string | null;
};

export default function AdminTeamShow({ team }: { team: Team }) {
    return (
        <>
            <Head title={`Time - ${team.name}`} />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-xl font-semibold tracking-tight">{team.name}</h1>
                    <Link href={`/admin/teams/${team.id}/edit`} className="rounded-sm border px-3 py-2 text-xs">
                        Editar
                    </Link>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Slug:</span> {team.slug}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Sigla:</span> {team.short_name ?? '-'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Ativo:</span> {team.is_active ? 'Sim' : 'Não'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Logo path:</span> {team.logo_path ?? '-'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Álbuns:</span> {team.albums_count}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Jogadores:</span> {team.players_count}</div>
                </div>

                <div className="rounded-sm border p-4 text-sm">
                    <div className="mb-1 text-xs uppercase text-muted-foreground">Descrição</div>
                    {team.description ?? 'Sem descrição'}
                </div>
            </div>
        </>
    );
}
