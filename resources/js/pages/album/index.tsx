import { Head, Link } from '@inertiajs/react';
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
    image_path: string | null;
    is_unlocked: boolean;
};

type AlbumPayload = {
    id: number;
    name: string;
    slug: string;
    season: string | null;
    team: { id: number; name: string; slug: string; short_name: string | null };
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

    const stickers = useMemo(() => {
        if (!album) {
            return [] as AlbumSticker[];
        }

        if (activeFilter === 'all') {
            return album.stickers;
        }

        return album.stickers.filter((item) => stickerTypeCategory(item.type) === activeFilter);
    }, [album, activeFilter]);

    return (
        <>
            <Head title="Meu Álbum" />
            <div className="space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Meu Álbum"
                    subtitle={note}
                    actions={(
                        <>
                            <Link href={packs?.link ?? '/packs'} className="rounded-sm border border-zinc-300 px-3 py-2 text-xs">
                                Pacotes pendentes: {packs?.pending ?? 0}
                            </Link>
                            {can?.createShareCard ? (
                                <Link
                                    href="/share-cards"
                                    method="post"
                                    data={{ type: 'album_progress' }}
                                    as="button"
                                    className="rounded-sm border bg-zinc-950 px-3 py-2 text-xs text-white"
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
                            <MetricCard label="Álbum ativo" value={album.name} hint={album.team.name} />
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
                            <section className="rounded-md border border-zinc-200 bg-white p-4">
                                <h2 className="text-sm font-semibold text-zinc-900">Conquistas de progresso</h2>
                                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                    {(progressAchievements ?? []).map((item) => (
                                        <div key={item.id} className="rounded-md border border-zinc-200 bg-zinc-50 p-2">
                                            <p className="text-xs font-medium text-zinc-900">{item.name}</p>
                                            <p className="text-[11px] text-zinc-600">Meta: {item.threshold ?? '-'}%</p>
                                            <div className="mt-1">
                                                <StatusBadge value={item.is_unlocked ? 'approved' : 'pending'} label={item.is_unlocked ? 'Desbloqueada' : 'Bloqueada'} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ) : null}

                        <section className="rounded-md border border-zinc-200 bg-white p-3">
                            <div className="flex flex-wrap gap-2">
                                {filters.map((filter) => (
                                    <button
                                        key={filter.value}
                                        type="button"
                                        onClick={() => setActiveFilter(filter.value)}
                                        className={`rounded-sm border px-3 py-1.5 text-xs ${
                                            activeFilter === filter.value
                                                ? 'border-zinc-950 bg-zinc-950 text-white'
                                                : 'border-zinc-300 bg-white text-zinc-700'
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
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                {stickers.map((sticker) => (
                                    <Link
                                        key={sticker.id}
                                        href={`/album/stickers/${sticker.id}`}
                                        className="block rounded-md border border-zinc-200 bg-white p-2 transition hover:bg-zinc-50"
                                    >
                                        <div className={`aspect-[3/4] overflow-hidden rounded-sm border ${sticker.is_unlocked ? 'border-zinc-300 bg-zinc-100' : 'border-zinc-300 bg-zinc-200/70'}`}>
                                            {sticker.image_path && sticker.is_unlocked ? (
                                                <img src={sticker.image_path} alt={sticker.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full flex-col items-center justify-center gap-1 px-2 text-center">
                                                    <div className="text-[11px] font-mono text-zinc-700">{sticker.code}</div>
                                                    <div className="text-[11px] text-zinc-500">
                                                        {sticker.is_unlocked ? 'Imagem indisponível' : 'Slot bloqueado'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            <div className="font-mono text-[11px] text-zinc-700">{sticker.code}</div>
                                            <div className="text-xs font-medium text-zinc-900">{sticker.title}</div>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[11px] uppercase text-zinc-500">{sticker.rarity}</span>
                                                <StatusBadge value={sticker.is_unlocked ? 'approved' : 'pending'} label={sticker.is_unlocked ? 'Ok' : 'Lock'} />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
