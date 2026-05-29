import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
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
            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader title={`Editar time: ${team.name}`} subtitle="Atualize identidade, status e metadados do time sem perder rastreabilidade." />
                <section className="admin-strip">
                    <p className="text-[10px] font-semibold tracking-[0.14em] text-dim uppercase">Manutenção de catálogo</p>
                    <p className="mt-1 text-sm text-foreground">As alterações ficam refletidas em páginas de álbum, figurinhas e painéis administrativos.</p>
                </section>
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
