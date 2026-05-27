import { Head, Link } from '@inertiajs/react';
import { EmptyState } from '@/components/ui/empty-state';
import { OriginBadge } from '@/components/ui/origin-badge';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';

type Mission = {
    id: number;
    title: string;
    slug: string;
    type: string;
    status: string;
    instructions: string | null;
    reward_pack_quantity: number;
    reward_pack_size: number;
    starts_at: string | null;
    ends_at: string | null;
    team: { id: number; name: string };
    album: { id: number; name: string };
    user_submission_status?: string | null;
};

function statusLabel(status: string | null | undefined): string {
    if (!status) {
        return 'Não enviada';
    }

    if (status === 'approved') {
        return 'Aprovada';
    }

    if (status === 'rejected') {
        return 'Rejeitada';
    }

    if (status === 'pending') {
        return 'Pendente';
    }

    return status;
}

export default function SocialMissionsIndex({ missions }: { missions: Mission[] }) {
    return (
        <>
            <Head title="Missões Sociais" />
            <div className="space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Missões Sociais Ativas"
                    subtitle="Participe das ações da temporada e receba pacotes após validação."
                    actions={<Link href="/social-submissions" className="rounded-sm border border-zinc-300 px-3 py-2 text-xs">Minhas submissões</Link>}
                />

                {missions.length === 0 ? (
                    <EmptyState title="Nenhuma missão ativa no momento." description="Quando o time publicar novas missões, elas aparecerão aqui." />
                ) : (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {missions.map((mission) => (
                            <article key={mission.id} className="rounded-md border border-zinc-200 bg-white p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-sm font-semibold text-zinc-900">{mission.title}</h2>
                                        <p className="text-xs text-zinc-500">{mission.type}</p>
                                    </div>
                                    <StatusBadge value={mission.user_submission_status ?? 'draft'} label={statusLabel(mission.user_submission_status)} />
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <OriginBadge source="social_mission" label={`${mission.reward_pack_quantity} pacote(s)`} />
                                    <OriginBadge source="social_mission" label={`${mission.reward_pack_size} figurinhas/pacote`} />
                                </div>
                                <p className="mt-3 text-xs text-zinc-600">Prazo: {mission.ends_at ?? 'indefinido'}</p>
                                <div className="mt-3">
                                    <Link href={`/social-missions/${mission.id}`} className="text-xs underline">Ver missão</Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
