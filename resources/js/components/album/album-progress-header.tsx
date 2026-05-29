import { Link } from '@inertiajs/react';
import { MetricCard } from '@/components/ui/metric-card';
import { ProgressBar } from '@/components/ui/progress-bar';

type Team = { id: number; name: string; slug: string; short_name: string | null };

type Props = {
    albumName: string;
    season: string | null;
    teams: Team[];
    unlocked: number;
    total: number;
    percent: number;
    pendingPacks: number;
    packsLink: string;
    canCreateShareCard?: boolean;
};

export function AlbumProgressHeader({
    albumName,
    season,
    teams,
    unlocked,
    total,
    percent,
    pendingPacks,
    packsLink,
    canCreateShareCard,
}: Props) {
    return (
        <section className="album-paper p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="brand-pill">Miolo do Álbum</p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{albumName}</h2>
                    <p className="mt-1 text-sm text-dim">{season ? `Temporada ${season}` : 'Temporada ativa'} · {teams.length} equipes</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {teams.map((team) => (
                            <span key={team.id} className="rounded-sm border border-border bg-muted/70 px-2 py-1 text-[11px] font-semibold tracking-[0.08em] text-foreground uppercase">
                                {team.short_name ?? team.name}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Link href={packsLink} className="rounded-sm border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground">
                        Pacotes pendentes: {pendingPacks}
                    </Link>
                    {canCreateShareCard ? (
                        <Link
                            href="/share-cards"
                            method="post"
                            data={{ type: 'album_progress' }}
                            as="button"
                            className="rounded-sm border border-primary bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                        >
                            Gerar card da temporada
                        </Link>
                    ) : null}
                </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MetricCard label="Coleção" value={`${unlocked}/${total}`} hint="Figurinhas únicas desbloqueadas" accent="success" />
                <MetricCard label="Progresso" value={`${percent}%`} hint={<ProgressBar value={percent} />} />
                <MetricCard label="Ritmo da temporada" value={pendingPacks > 0 ? 'Pacotes disponíveis' : 'Sem pendências'} hint="Abra pacotes e avance no álbum" accent={pendingPacks > 0 ? 'warning' : 'default'} />
            </div>
        </section>
    );
}
