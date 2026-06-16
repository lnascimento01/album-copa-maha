import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import PlayerForm from './form';

type Team = { id: number; name: string };

export default function AdminPlayerCreate({ teams, types }: { teams: Team[]; types: string[] }) {
    return (
        <>
            <Head title="Novo Jogador/Personagem" />
            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader title="Novo jogador/personagem" subtitle="Cadastre atletas e personagens com estrutura pronta para figurinhas da Copa AAPH." />
                <section className="admin-strip">
                    <p className="text-[10px] font-semibold tracking-[0.14em] text-dim uppercase">Entrada de elenco</p>
                    <p className="mt-1 text-sm text-foreground">Preencha dados do card para facilitar catálogo, busca e organização visual do álbum.</p>
                </section>
                <PlayerForm
                    teams={teams}
                    types={types}
                    initialValues={{
                        team_id: '',
                        name: '',
                        nickname: '',
                        shirt_number: '',
                        position: '',
                        type: types[0] ?? 'player',
                        bio: '',
                        photo_path: '',
                        photo_upload: null,
                        sort_order: 0,
                        is_active: true,
                    }}
                    method="post"
                    submitUrl="/admin/players"
                    submitLabel="Criar"
                />
            </div>
        </>
    );
}
