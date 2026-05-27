import { Head } from '@inertiajs/react';
import AchievementForm from './form';

type RefItem = { id: number; name: string };

type Props = {
    types: string[];
    teams: RefItem[];
    albums: RefItem[];
};

export default function AdminAchievementsCreate({ types, teams, albums }: Props) {
    return (
        <>
            <Head title="Nova Conquista" />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Nova Conquista</h1>
                <AchievementForm
                    initialValues={{
                        team_id: '',
                        album_id: '',
                        name: '',
                        slug: '',
                        description: '',
                        type: types[0] ?? 'stickers_unlocked',
                        threshold: 1,
                        icon: 'badge',
                        color: '#0f172a',
                        is_active: true,
                        sort_order: 0,
                    }}
                    types={types}
                    teams={teams}
                    albums={albums}
                    method="post"
                    submitUrl="/admin/achievements"
                    submitLabel="Criar conquista"
                />
            </div>
        </>
    );
}
