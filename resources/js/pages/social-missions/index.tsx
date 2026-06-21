import { Head, Link } from '@inertiajs/react';
import type { DriveStep } from 'driver.js';
import { PageTour, TourReplayButton } from '@/components/page-tour';
import { EmptyState } from '@/components/ui/empty-state';
import { OriginBadge } from '@/components/ui/origin-badge';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { fmtDateTimeBr } from '@/lib/date';

const TOUR_STEPS: DriveStep[] = [
    {
        popover: {
            title: 'Missões sociais',
            description: 'Cumpra missões do time, envie sua prova e ganhe pacotes após a validação.',
        },
    },
    {
        element: '[data-tour="missions-list"]',
        popover: {
            title: 'Escolha uma missão',
            description: 'Cada card mostra a recompensa e o prazo. Toque em “Abrir missão” para ver as instruções e enviar sua participação.',
        },
    },
];

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
            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Desafios da Temporada"
                    subtitle="Cumpra missões oficiais, envie sua prova e receba pacotes após validação."
                    actions={(
                        <div className="flex flex-wrap gap-2">
                            <TourReplayButton tourKey="social-missions" />
                            <Link href="/social-submissions" className="rounded-sm border border-border bg-card px-3 py-2 text-xs font-semibold">Minhas submissões</Link>
                        </div>
                    )}
                />

                <section className="season-hero">
                    <div className="relative z-10">
                        <p className="season-kicker">Circuito social AAPH</p>
                        <h2 className="mt-2 text-2xl font-semibold text-primary-foreground">Missões valendo figurinhas</h2>
                        <p className="mt-1 max-w-2xl text-sm text-primary-foreground/85">
                            Cada missão aprovada rende pacotes e acelera seu progresso no álbum da temporada.
                        </p>
                    </div>
                </section>

                {missions.length === 0 ? (
                    <EmptyState title="Nenhuma missão ativa no momento." description="Quando o time publicar novas missões, elas aparecerão aqui." />
                ) : (
                    <div data-tour="missions-list" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {missions.map((mission) => (
                            <article key={mission.id} className="mission-ticket">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-semibold tracking-[0.12em] text-dim uppercase">
                                            {mission.team.name} · {mission.album.name}
                                        </p>
                                        <h2 className="mt-1 text-sm font-semibold text-foreground">{mission.title}</h2>
                                        <p className="text-xs text-dim">{mission.type}</p>
                                    </div>
                                    <StatusBadge value={mission.user_submission_status ?? 'draft'} label={statusLabel(mission.user_submission_status)} />
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                    <div className="rounded-sm border border-border bg-card/60 px-2 py-1.5">
                                        <p className="text-[10px] uppercase tracking-[0.1em] text-dim">Recompensa</p>
                                        <p className="mt-1 font-semibold text-foreground">{mission.reward_pack_quantity} pacote(s)</p>
                                    </div>
                                    <div className="rounded-sm border border-border bg-card/60 px-2 py-1.5">
                                        <p className="text-[10px] uppercase tracking-[0.1em] text-dim">Conteúdo</p>
                                        <p className="mt-1 font-semibold text-foreground">{mission.reward_pack_size} fig./pacote</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                                    <span className="rounded-sm border border-border bg-card/65 px-2 py-1 text-dim">
                                        Prazo: {mission.ends_at ? fmtDateTimeBr(mission.ends_at) : 'indefinido'}
                                    </span>
                                    <OriginBadge source="social_mission" label="Missão oficial" />
                                </div>
                                <div className="mt-3 flex justify-end">
                                    <Link href={`/social-missions/${mission.id}`} className="app-link-chip">Abrir missão</Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            <PageTour tourKey="social-missions" steps={TOUR_STEPS} enabled={missions.length > 0} />
        </>
    );
}
