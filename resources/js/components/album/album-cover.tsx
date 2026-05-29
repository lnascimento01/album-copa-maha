import { Link } from '@inertiajs/react';

type Team = { id: number; name: string; slug: string; short_name: string | null };

type Props = {
    albumName: string;
    season: string | null;
    teams: Team[];
    percent: number;
    unlocked: number;
    total: number;
    packsLink: string;
    pendingPacks: number;
};

export function AlbumCover({
    albumName,
    season,
    teams,
    percent,
    unlocked,
    total,
    packsLink,
    pendingPacks,
}: Props) {
    return (
        <section className="album-cover">
            <span className="album-cover-gloss" />
            <div className="relative z-10">
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-primary-foreground/85">
                    Álbum da Copa AAPH
                </p>
                <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
                    {albumName}
                </h1>
                <p className="mt-2 text-sm text-primary-foreground/85">
                    {season ? `Temporada ${season}` : 'Temporada ativa'} · Coleção oficial
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 backdrop-blur-[1px]">
                        <p className="text-[10px] tracking-[0.14em] uppercase text-primary-foreground/80">Coleção</p>
                        <p className="mt-1 text-xl font-semibold text-white">{unlocked}/{total}</p>
                    </div>
                    <div className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 backdrop-blur-[1px]">
                        <p className="text-[10px] tracking-[0.14em] uppercase text-primary-foreground/80">Progresso</p>
                        <p className="mt-1 text-xl font-semibold text-white">{percent}%</p>
                    </div>
                    <div className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 backdrop-blur-[1px]">
                        <p className="text-[10px] tracking-[0.14em] uppercase text-primary-foreground/80">Pacotes</p>
                        <p className="mt-1 text-xl font-semibold text-white">{pendingPacks} pendentes</p>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                    {teams.map((team) => (
                        <span
                            key={team.id}
                            className="rounded-sm border border-white/35 bg-white/10 px-2 py-1 text-[11px] font-semibold tracking-[0.08em] text-primary-foreground uppercase"
                        >
                            {team.short_name ?? team.name}
                        </span>
                    ))}
                </div>

                <div className="mt-5">
                    <Link
                        href={packsLink}
                        className="inline-flex items-center rounded-sm border border-[color:var(--brand-secondary)] bg-[color:var(--brand-secondary)] px-3 py-2 text-xs font-semibold tracking-wide text-[color:var(--brand-secondary-foreground)] uppercase"
                    >
                        Abrir pacotes da rodada
                    </Link>
                </div>
            </div>
        </section>
    );
}
