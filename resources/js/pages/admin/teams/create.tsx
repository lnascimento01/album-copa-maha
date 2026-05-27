import { Head } from '@inertiajs/react';
import TeamForm from './form';

export default function AdminTeamCreate() {
    return (
        <>
            <Head title="Novo Time" />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Novo Time</h1>
                <TeamForm
                    initialValues={{
                        name: '',
                        slug: '',
                        short_name: '',
                        description: '',
                        logo_path: '',
                        primary_color: '',
                        secondary_color: '',
                        is_active: true,
                    }}
                    method="post"
                    submitUrl="/admin/teams"
                    submitLabel="Criar time"
                />
            </div>
        </>
    );
}
