import { Head } from '@inertiajs/react';
import AchievementForm from './form';

type RefItem = { id: number; name: string };

type Props = {
    achievement: {
        id: number;
        team_id: number | null;
        album_id: number | null;
        name: string;
        slug: string;
        description: string | null;
        type: string;
        threshold: number | null;
        icon: string | null;
        color: string | null;
        is_active: boolean;
        sort_order: number;
    };
    types: string[];
    teams: RefItem[];
    albums: RefItem[];
};

export default function AdminAchievementsEdit({ achievement, types, teams, albums }: Props) {
    return (
        <>
            <Head title={`Editar Conquista #${achievement.id}`} />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Editar Conquista</h1>
                <AchievementForm
                    initialValues={{
                        team_id: achievement.team_id ?? '',
                        album_id: achievement.album_id ?? '',
                        name: achievement.name,
                        slug: achievement.slug,
                        description: achievement.description ?? '',
                        type: achievement.type,
                        threshold: achievement.threshold ?? '',
                        icon: achievement.icon ?? '',
                        color: achievement.color ?? '',
                        is_active: achievement.is_active,
                        sort_order: achievement.sort_order,
                    }}
                    types={types}
                    teams={teams}
                    albums={albums}
                    method="patch"
                    submitUrl={`/admin/achievements/${achievement.id}`}
                    submitLabel="Salvar"
                />
            </div>
        </>
    );
}
