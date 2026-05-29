import { Head } from '@inertiajs/react';
import ActivityForm from './form';

type Team = { id: number; name: string };
type Album = { id: number; name: string; team_id?: number };

export default function AdminActivityCreate({ teams, albums, types }: { teams: Team[]; albums: Album[]; types: string[] }) {
    return (
        <>
            <Head title="Nova Atividade" />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Nova Atividade</h1>
                <ActivityForm
                    initialValues={{
                        team_id: '',
                        album_id: '',
                        title: '',
                        slug: '',
                        type: types[0] ?? 'training',
                        description: '',
                        location_name: '',
                        latitude: '',
                        longitude: '',
                        radius_meters: 150,
                        max_accuracy_meters: 100,
                        event_timezone: 'America/Sao_Paulo',
                        starts_at: '',
                        ends_at: '',
                        reward_pack_quantity: 1,
                        reward_pack_size: 3,
                    }}
                    teams={teams}
                    albums={albums}
                    types={types}
                    method="post"
                    submitUrl="/admin/activities"
                    submitLabel="Criar atividade"
                />
            </div>
        </>
    );
}
