import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import TeamForm from './form';

export default function AdminTeamCreate() {
    return (
        <>
            <Head title="Novo Time" />
            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader title="Novo time" subtitle="Cadastre uma equipe para uso em álbuns, catálogo de atletas e campanhas da temporada." />
                <section className="admin-strip">
                    <p className="text-[10px] font-semibold tracking-[0.14em] text-dim uppercase">Base organizacional</p>
                    <p className="mt-1 text-sm text-foreground">Use nomes e siglas oficiais para manter consistência visual no Álbum da Copa AAPH.</p>
                </section>
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
