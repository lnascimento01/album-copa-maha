import { Head, Link } from '@inertiajs/react';

type Player = {
    id: number;
    name: string;
    nickname: string | null;
    shirt_number: string | null;
    position: string | null;
    type: string;
    bio: string | null;
    photo_path: string | null;
    is_active: boolean;
    sort_order: number;
    team: { id: number; name: string; slug: string };
};

export default function AdminPlayerShow({ player }: { player: Player }) {
    return (
        <>
            <Head title={`Jogador - ${player.name}`} />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-xl font-semibold tracking-tight">{player.name}</h1>
                    <Link href={`/admin/players/${player.id}/edit`} className="rounded-sm border px-3 py-2 text-xs">Editar</Link>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Time:</span> {player.team.name}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Tipo:</span> {player.type}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Apelido:</span> {player.nickname ?? '-'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Número:</span> {player.shirt_number ?? '-'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Posição:</span> {player.position ?? '-'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Ativo:</span> {player.is_active ? 'Sim' : 'Não'}</div>
                </div>

                <div className="rounded-sm border p-4 text-sm">
                    <div className="mb-1 text-xs uppercase text-muted-foreground">Bio</div>
                    {player.bio ?? 'Sem bio'}
                </div>
            </div>
        </>
    );
}
