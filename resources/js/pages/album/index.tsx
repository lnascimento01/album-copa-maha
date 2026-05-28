import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricCard } from '@/components/ui/metric-card';
import { PageHeader } from '@/components/ui/page-header';
import { ProgressBar } from '@/components/ui/progress-bar';
import { StatusBadge } from '@/components/ui/status-badge';

type AlbumSticker = {
    id: number;
    code: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    type: string;
    rarity: string;
    image_url: string | null;
    is_unlocked: boolean;
    team?: { slug: string | null; name: string | null };
};

type AlbumPayload = {
    id: number;
    name: string;
    slug: string;
    season: string | null;
    team: { id: number; name: string; slug: string; short_name: string | null };
    teams: Array<{ id: number; name: string; slug: string; short_name: string | null }>;
    stickers: AlbumSticker[];
};

type FilterItem = { label: string; value: string };

type Props = {
    album: AlbumPayload | null;
    progress: { total: number; unlocked: number; percent: number };
    packs?: { pending: number; link: string };
    can?: { createShareCard: boolean };
    progressAchievements?: Array<{ id: number; name: string; threshold: number | null; is_unlocked: boolean }>;
    filters: FilterItem[];
    note: string;
};

const PAGE_SIZE = 12;

function stickerTypeCategory(type: string): string {
    if (type === 'player') {
        return 'player';
    }

    if (type === 'goalkeeper') {
        return 'goalkeeper';
    }

    if (['staff', 'coach'].includes(type)) {
        return 'staff';
    }

    if (type === 'moment') {
        return 'moment';
    }

    if (['special', 'legend', 'team'].includes(type)) {
        return 'special';
    }

    return 'all';
}

export default function AlbumIndex({ album, progress, packs, can, progressAchievements, filters, note }: Props) {
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [activeTeam, setActiveTeam] = useState<string>('all');
    const [page, setPage] = useState(1);

    const teamOptions = useMemo(() => {
        if (!album) {
            return [] as Array<{ label: string; value: string }>;
        }

        return [
            { label: 'Todas equipes', value: 'all' },
            ...album.teams.map((team) => ({ label: team.short_name ?? team.name, value: team.slug })),
        ];
    }, [album]);

    const stickers = useMemo(() => {
        if (!album) {
            return [] as AlbumSticker[];
        }

        return album.stickers.filter((item) => {
            const matchesType = activeFilter === 'all' || stickerTypeCategory(item.type) === activeFilter;
            const matchesTeam = activeTeam === 'all' || item.team?.slug === activeTeam;

            return matchesType && matchesTeam;
        });
    }, [album, activeFilter, activeTeam]);

    const pageCount = Math.max(1, Math.ceil(stickers.length / PAGE_SIZE));

    const pagedStickers = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;

        return stickers.slice(start, start + PAGE_SIZE);
    }, [page, stickers]);

    return (
        <>
            <Head title="Meu Álbum" />
            <div className="space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Meu Álbum"
                    subtitle={note}
                    actions={(
                        <>
                            <Link href={packs?.link ?? '/packs'} className="rounded-sm border border-border bg-card px-3 py-2 text-xs">
                                Pacotes pendentes: {packs?.pending ?? 0}
                            </Link>
                            {can?.createShareCard ? (
                                <Link
                                    href="/share-cards"
                                    method="post"
                                    data={{ type: 'album_progress' }}
                                    as="button"
                                    className="rounded-sm border border-primary bg-primary px-3 py-2 text-xs text-primary-foreground"
                                >
                                    Gerar card de progresso
                                </Link>
                            ) : null}
                        </>
                    )}
                />

                {!album ? (
                    <EmptyState
                        title="Nenhum álbum ativo disponível."
                        description="A administração precisa publicar um álbum ativo para você começar a coleção."
                    />
                ) : (
                    <>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <MetricCard
                                label="Álbum ativo"
                                value={album.name}
                                hint={album.teams.length > 0 ? album.teams.map((team) => team.short_name ?? team.name).join(' • ') : album.team.name}
                            />
                            <MetricCard label="Figurinhas desbloqueadas" value={`${progress.unlocked}/${progress.total}`} accent="success" />
                            <MetricCard label="Progresso" value={`${progress.percent}%`} hint={<ProgressBar value={progress.percent} />} />
                            <MetricCard
                                label="Pacotes"
                                value={packs?.pending ?? 0}
                                hint={<Link href={packs?.link ?? '/packs'} className="underline">Abrir pacotes</Link>}
                                accent={(packs?.pending ?? 0) > 0 ? 'warning' : 'default'}
                            />
                        </div>

                        {(progressAchievements ?? []).length > 0 ? (
                            <section className="rounded-md border border-border bg-card p-4">
                                <h2 className="text-sm font-semibold text-foreground">Conquistas de progresso</h2>
                                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                    {(progressAchievements ?? []).map((item) => (
                                        <div key={item.id} className="rounded-md border border-border bg-muted/70 p-2">
                                            <p className="text-xs font-medium text-foreground">{item.name}</p>
                                            <p className="text-[11px] text-dim">Meta: {item.threshold ?? '-'}%</p>
                                            <div className="mt-1">
                                                <StatusBadge value={item.is_unlocked ? 'approved' : 'pending'} label={item.is_unlocked ? 'Desbloqueada' : 'Bloqueada'} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ) : null}

                        <section className="space-y-3 rounded-md border border-border bg-card p-3">
                            <div className="flex flex-wrap gap-2">
                                {teamOptions.map((team) => (
                                    <button
                                        key={team.value}
                                        type="button"
                                        onClick={() => {
                                            setActiveTeam(team.value);
                                            setPage(1);
                                        }}
                                        className={`rounded-sm border px-3 py-1.5 text-xs ${
                                            activeTeam === team.value
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border bg-background text-foreground'
                                        }`}
                                    >
                                        {team.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {filters.map((filter) => (
                                    <button
                                        key={filter.value}
                                        type="button"
                                        onClick={() => {
                                            setActiveFilter(filter.value);
                                            setPage(1);
                                        }}
                                        className={`rounded-sm border px-3 py-1.5 text-xs ${
                                            activeFilter === filter.value
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border bg-background text-foreground'
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {stickers.length === 0 ? (
                            <EmptyState title="Nenhuma figurinha para este filtro." description="Tente outro grupo para continuar navegando no álbum." />
                        ) : (
                            <section className="space-y-3 rounded-md border border-border bg-card p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-xs tracking-wide text-dim uppercase">
                                        Página {page} de {pageCount} · {stickers.length} slots
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                            disabled={page === 1}
                                            className="inline-flex items-center gap-1 rounded-sm border border-border bg-background px-2 py-1 text-xs disabled:opacity-40"
                                        >
                                            <ChevronLeft className="size-3.5" />
                                            Anterior
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
                                            disabled={page >= pageCount}
                                            className="inline-flex items-center gap-1 rounded-sm border border-border bg-background px-2 py-1 text-xs disabled:opacity-40"
                                        >
                                            Próxima
                                            <ChevronRight className="size-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                    {pagedStickers.map((sticker, index) => (
                                        <Link
                                            key={sticker.id}
                                            href={`/album/stickers/${sticker.id}`}
                                            className="group relative block rounded-md border border-border bg-background p-2 transition hover:-translate-y-0.5 hover:bg-muted motion-reduce:transform-none"
                                            style={{ animationDelay: `${index * 24}ms` }}
                                        >
                                            <div className={`aspect-[3/4] overflow-hidden rounded-sm border ${sticker.is_unlocked ? 'border-border bg-muted' : 'border-border bg-muted/60'}`}>
                                                {sticker.image_url && sticker.is_unlocked ? (
                                                    <img src={sticker.image_url} alt={sticker.title} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full flex-col items-center justify-center gap-1 px-2 text-center">
                                                        <div className="text-[11px] font-mono text-dim">{sticker.code}</div>
                                                        <div className="text-[11px] text-dim">
                                                            {sticker.is_unlocked ? 'Imagem indisponível' : 'Slot bloqueado'}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-2 space-y-1">
                                                <div className="font-mono text-[11px] text-dim">{sticker.code}</div>
                                                <div className="line-clamp-2 text-xs font-medium text-foreground">{sticker.title}</div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[11px] uppercase text-dim">{sticker.rarity}</span>
                                                    <StatusBadge value={sticker.is_unlocked ? 'approved' : 'pending'} label={sticker.is_unlocked ? 'Ok' : 'Lock'} />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
