import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { AlbumBook } from '@/components/album/album-book';
import { AlbumProgressHeader } from '@/components/album/album-progress-header';
import { EmptyState } from '@/components/ui/empty-state';
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
    team?: { slug: string | null; name: string | null; short_name?: string | null };
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
};

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

export default function AlbumIndex({ album, progress, packs, can, progressAchievements, filters }: Props) {
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [activeTeam, setActiveTeam] = useState<string>('all');

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

    return (
        <>
            <Head title="Meu Álbum" />
            <div className="brand-app-bg space-y-3 p-3 sm:space-y-4 sm:p-4">
                {!album ? (
                    <EmptyState
                        title="Nenhum álbum ativo disponível."
                        description="A administração precisa publicar um álbum ativo para você começar a coleção."
                    />
                ) : (
                    <>
                        <AlbumProgressHeader
                            albumName={album.name}
                            season={album.season}
                            teams={album.teams}
                            unlocked={progress.unlocked}
                            total={progress.total}
                            percent={progress.percent}
                            pendingPacks={packs?.pending ?? 0}
                            packsLink={packs?.link ?? '/packs'}
                            canCreateShareCard={can?.createShareCard}
                        />

                        <section className="album-paper p-2.5 sm:p-3">
                            <p className="text-xs text-dim sm:text-sm">
                                Complete sua coleção oficial da Copa AAPH. Abra pacotes, encontre figurinhas e avance página por página.
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                                {teamOptions.map((team) => (
                                    <button
                                        key={team.value}
                                        type="button"
                                        onClick={() => setActiveTeam(team.value)}
                                        className={`rounded-sm border px-2.5 py-1 text-[11px] font-semibold tracking-wide sm:px-3 sm:py-1.5 sm:text-xs ${
                                            activeTeam === team.value
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border bg-card text-foreground'
                                        }`}
                                    >
                                        {team.label}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-1.5 flex flex-wrap gap-1.5 sm:gap-2">
                                {filters.map((filter) => (
                                    <button
                                        key={filter.value}
                                        type="button"
                                        onClick={() => setActiveFilter(filter.value)}
                                        className={`rounded-sm border px-2.5 py-1 text-[11px] font-semibold tracking-wide sm:px-3 sm:py-1.5 sm:text-xs ${
                                            activeFilter === filter.value
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border bg-card text-foreground'
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <AlbumBook
                            coverImageUrl="/brand/capa_album.png"
                            albumName={album.name}
                            season={album.season}
                            teams={album.teams}
                            stickers={stickers.map((sticker) => ({
                                id: sticker.id,
                                code: sticker.code,
                                title: sticker.title,
                                subtitle: sticker.subtitle,
                                rarity: sticker.rarity,
                                imageUrl: sticker.image_url,
                                unlocked: sticker.is_unlocked,
                                teamShort: sticker.team?.short_name ?? sticker.team?.name ?? null,
                            }))}
                        />

                        {(progressAchievements ?? []).length > 0 ? (
                            <section className="album-paper p-4">
                                <h2 className="text-sm font-semibold text-foreground">Conquistas da sua temporada de coleção</h2>
                                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                    {(progressAchievements ?? []).map((item) => (
                                        <div key={item.id} className="rounded-md border border-border bg-muted/70 p-2">
                                            <p className="text-xs font-semibold text-foreground">{item.name}</p>
                                            <p className="text-[11px] text-dim">Meta: {item.threshold ?? '-'}%</p>
                                            <div className="mt-1">
                                                <StatusBadge value={item.is_unlocked ? 'approved' : 'pending'} label={item.is_unlocked ? 'Desbloqueada' : 'Bloqueada'} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ) : null}
                    </>
                )}
            </div>
        </>
    );
}
