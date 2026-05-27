import { Head } from '@inertiajs/react';
import TeamForm from './form';

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
};

export default function AdminTeamEdit({ team }: { team: Team }) {
    return (
        <>
            <Head title={`Editar Time - ${team.name}`} />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Editar Time</h1>
                <TeamForm
                    initialValues={{
                        name: team.name,
                        slug: team.slug,
                        short_name: team.short_name ?? '',
                        description: team.description ?? '',
                        logo_path: team.logo_path ?? '',
                        primary_color: team.primary_color ?? '',
                        secondary_color: team.secondary_color ?? '',
                        is_active: team.is_active,
                    }}
                    method="patch"
                    submitUrl={`/admin/teams/${team.id}`}
                    submitLabel="Salvar alterações"
                />
            </div>
        </>
    );
}
