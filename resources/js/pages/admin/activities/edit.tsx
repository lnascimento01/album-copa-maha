import { Head } from '@inertiajs/react';
import ActivityForm from './form';

type Team = { id: number; name: string };
type Album = { id: number; name: string; team_id?: number };
type Activity = {
    id: number;
    team_id: number;
    album_id: number;
    title: string;
    slug: string;
    type: string;
    description: string | null;
    starts_at: string | null;
    ends_at: string | null;
    reward_pack_quantity: number;
    reward_pack_size: number;
};

export default function AdminActivityEdit({ activity, teams, albums, types }: { activity: Activity; teams: Team[]; albums: Album[]; types: string[] }) {
    return (
        <>
            <Head title={`Editar Atividade - ${activity.title}`} />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Editar Atividade</h1>
                <ActivityForm
                    initialValues={{
                        team_id: activity.team_id,
                        album_id: activity.album_id,
                        title: activity.title,
                        slug: activity.slug,
                        type: activity.type,
                        description: activity.description ?? '',
                        starts_at: activity.starts_at ?? '',
                        ends_at: activity.ends_at ?? '',
                        reward_pack_quantity: activity.reward_pack_quantity,
                        reward_pack_size: activity.reward_pack_size,
                    }}
                    teams={teams}
                    albums={albums}
                    types={types}
                    method="patch"
                    submitUrl={`/admin/activities/${activity.id}`}
                    submitLabel="Salvar alterações"
                />
            </div>
        </>
    );
}
