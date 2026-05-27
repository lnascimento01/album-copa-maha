import { Head } from '@inertiajs/react';
import PlayerForm from './form';

type Team = { id: number; name: string };

type Player = {
    id: number;
    team_id: number;
    name: string;
    nickname: string | null;
    shirt_number: string | null;
    position: string | null;
    type: string;
    bio: string | null;
    photo_path: string | null;
    sort_order: number;
    is_active: boolean;
};

export default function AdminPlayerEdit({ player, teams, types }: { player: Player; teams: Team[]; types: string[] }) {
    return (
        <>
            <Head title={`Editar - ${player.name}`} />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Editar Jogador/Personagem</h1>
                <p className="text-sm text-zinc-600">Ajuste nome, posição e texto do card para o catálogo final da demo.</p>
                <PlayerForm
                    teams={teams}
                    types={types}
                    initialValues={{
                        team_id: player.team_id,
                        name: player.name,
                        nickname: player.nickname ?? '',
                        shirt_number: player.shirt_number ?? '',
                        position: player.position ?? '',
                        type: player.type,
                        bio: player.bio ?? '',
                        photo_path: player.photo_path ?? '',
                        sort_order: player.sort_order,
                        is_active: player.is_active,
                    }}
                    method="patch"
                    submitUrl={`/admin/players/${player.id}`}
                    submitLabel="Salvar"
                />
            </div>
        </>
    );
}
