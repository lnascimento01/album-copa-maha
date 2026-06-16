import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';
import PlayerForm from './form';

type Team = { id: number; name: string };

type Player = {
    id: number;
    team_id: number;
    name: string;
    nickname: string | null;
    shirt_number: string | null;
    position: string | null;
    type: string;
    bio: string | null;
    photo_path: string | null;
    sort_order: number;
    is_active: boolean;
};

export default function AdminPlayerEdit({ player, teams, types }: { player: Player; teams: Team[]; types: string[] }) {
    return (
        <>
            <Head title={`Editar - ${player.name}`} />
            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader title={`Editar jogador: ${player.name}`} subtitle="Ajuste posição, texto do card e visibilidade no catálogo da temporada." />
                <section className="admin-strip">
                    <p className="text-[10px] font-semibold tracking-[0.14em] text-dim uppercase">Curadoria do card</p>
                    <p className="mt-1 text-sm text-foreground">Garanta que nome, número e tipo estejam alinhados à experiência oficial do Álbum da Copa AAPH.</p>
                </section>
                <PlayerForm
                    teams={teams}
                    types={types}
                    initialValues={{
                        team_id: player.team_id,
                        name: player.name,
                        nickname: player.nickname ?? '',
                        shirt_number: player.shirt_number ?? '',
                        position: player.position ?? '',
                        type: player.type,
                        bio: player.bio ?? '',
                        photo_path: player.photo_path ?? '',
                        photo_upload: null,
                        sort_order: player.sort_order,
                        is_active: player.is_active,
                    }}
                    method="patch"
                    submitUrl={`/admin/players/${player.id}`}
                    submitLabel="Salvar"
                />
            </div>
        </>
    );
}
