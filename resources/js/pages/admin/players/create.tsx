import { Head } from '@inertiajs/react';
import PlayerForm from './form';

type Team = { id: number; name: string };

export default function AdminPlayerCreate({ teams, types }: { teams: Team[]; types: string[] }) {
    return (
        <>
            <Head title="Novo Jogador/Personagem" />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Novo Jogador/Personagem</h1>
                <p className="text-sm text-zinc-600">Cadastre o atleta/personagem com dados prontos para figurinha da temporada.</p>
                <PlayerForm
                    teams={teams}
                    types={types}
                    initialValues={{
                        team_id: '',
                        name: '',
                        nickname: '',
                        shirt_number: '',
                        position: '',
                        type: types[0] ?? 'player',
                        bio: '',
                        photo_path: '',
                        sort_order: 0,
                        is_active: true,
                    }}
                    method="post"
                    submitUrl="/admin/players"
                    submitLabel="Criar"
                />
            </div>
        </>
    );
}
