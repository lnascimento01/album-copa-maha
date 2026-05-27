import { Head } from '@inertiajs/react';
import SocialMissionForm from './form';

type Team = { id: number; name: string };
type Album = { id: number; name: string; team_id?: number };
type Mission = {
    id: number;
    team_id: number;
    album_id: number;
    title: string;
    slug: string;
    description: string | null;
    instructions: string | null;
    status: string;
    type: string;
    reward_pack_quantity: number;
    reward_pack_size: number;
    starts_at: string | null;
    ends_at: string | null;
    max_submissions_total: number | null;
    max_submissions_per_user: number;
};

export default function AdminSocialMissionEdit({ mission, teams, albums, statuses, types }: { mission: Mission; teams: Team[]; albums: Album[]; statuses: string[]; types: string[] }) {
    return (
        <>
            <Head title={`Editar Missão - ${mission.title}`} />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Editar Missão Social</h1>
                <SocialMissionForm
                    initialValues={{
                        team_id: mission.team_id,
                        album_id: mission.album_id,
                        title: mission.title,
                        slug: mission.slug,
                        description: mission.description ?? '',
                        instructions: mission.instructions ?? '',
                        status: mission.status,
                        type: mission.type,
                        reward_pack_quantity: mission.reward_pack_quantity,
                        reward_pack_size: mission.reward_pack_size,
                        starts_at: mission.starts_at ?? '',
                        ends_at: mission.ends_at ?? '',
                        max_submissions_total: mission.max_submissions_total ?? '',
                        max_submissions_per_user: mission.max_submissions_per_user,
                    }}
                    teams={teams}
                    albums={albums}
                    statuses={statuses}
                    types={types}
                    method="patch"
                    submitUrl={`/admin/social-missions/${mission.id}`}
                    submitLabel="Salvar alterações"
                />
            </div>
        </>
    );
}
