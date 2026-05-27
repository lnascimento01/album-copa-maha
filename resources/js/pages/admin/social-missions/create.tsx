import { Head } from '@inertiajs/react';
import SocialMissionForm from './form';

type Team = { id: number; name: string };
type Album = { id: number; name: string; team_id?: number };

export default function AdminSocialMissionCreate({ teams, albums, statuses, types }: { teams: Team[]; albums: Album[]; statuses: string[]; types: string[] }) {
    return (
        <>
            <Head title="Nova Missão Social" />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Nova Missão Social</h1>
                <SocialMissionForm
                    initialValues={{
                        team_id: '',
                        album_id: '',
                        title: '',
                        slug: '',
                        description: '',
                        instructions: '',
                        status: statuses[0] ?? 'draft',
                        type: types[0] ?? 'instagram_story',
                        reward_pack_quantity: 1,
                        reward_pack_size: 3,
                        starts_at: '',
                        ends_at: '',
                        max_submissions_total: '',
                        max_submissions_per_user: 1,
                    }}
                    teams={teams}
                    albums={albums}
                    statuses={statuses}
                    types={types}
                    method="post"
                    submitUrl="/admin/social-missions"
                    submitLabel="Criar missão"
                />
            </div>
        </>
    );
}
