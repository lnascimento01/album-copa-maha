import { Head, Link, router, usePage } from '@inertiajs/react';
import { Sparkles, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { OriginBadge } from '@/components/ui/origin-badge';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';

type Sticker = {
    id: number;
    code: string;
    title: string;
    subtitle: string | null;
    type: string;
    rarity: string;
    image_url: string;
};

type PackItem = { id: number; sticker: Sticker };

type Pack = {
    id: number;
    status: string;
    source: string;
    size: number;
    metadata: Record<string, unknown> | null;
    created_at: string | null;
    opened_at: string | null;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    album: { id: number; name: string; slug: string };
    activity?: { id: number; title: string; type: string; status: string } | null;
    reward_code?: { id: number; code: string; title: string; status: string } | null;
    social_mission?: { id: number; title: string; slug: string; status: string } | null;
    activity_checkin_id?: number | null;
    items: PackItem[];
};

type Flash = {
    success?: string | null;
    error?: string | null;
    revealedStickerIds?: number[] | null;
};

function sourceLabel(pack: Pack): string {
    if (pack.source === 'checkin' && pack.activity) {
        return `Check-in: ${pack.activity.title}`;
    }

    if (pack.source === 'reward_code' && pack.reward_code) {
        return `Código promocional: ${pack.reward_code.code}`;
    }

    if (pack.source === 'social_mission' && pack.social_mission) {
        return `Missão social: ${pack.social_mission.title}`;
    }

    return 'Concessão manual';
}

export default function PackShow({ pack }: { pack: Pack }) {
    const page = usePage<{ flash?: Flash }>();
    const revealedIds = page.props.flash?.revealedStickerIds ?? [];
    const [isOpening, setIsOpening] = useState(false);

    const reducedMotion = useMemo(
        () => (typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false),
        [],
    );

    const openPack = () => {
        setIsOpening(true);
        router.post(`/packs/${pack.id}/open`, {}, {
            preserveScroll: true,
            onFinish: () => setIsOpening(false),
        });
    };

    return (
        <>
            <Head title={`Pacote #${pack.id}`} />
            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader
                    title={`Pacote #${pack.id}`}
                    subtitle="Revelação da rodada e histórico das figurinhas entregues."
                    actions={<Link href="/packs" className="rounded-sm border border-border bg-card px-3 py-2 text-xs font-semibold">Voltar para pacotes</Link>}
                />

                <section className="season-hero">
                    <div className="relative z-10">
                        <p className="season-kicker">Reveal AAPH</p>
                        <h2 className="mt-2 text-2xl font-semibold text-primary-foreground">Momento da revelação</h2>
                        <p className="mt-1 max-w-xl text-sm text-primary-foreground/85">
                            Abra o pacote, revele figurinhas da rodada e acompanhe a evolução da coleção.
                        </p>
                    </div>
                </section>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="album-paper p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-dim">Status</div>
                        <div className="mt-2"><StatusBadge value={pack.status} /></div>
                    </div>
                    <div className="album-paper p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-dim">Álbum</div>
                        <div className="mt-2 font-medium text-foreground">{pack.album.name}</div>
                    </div>
                    <div className="album-paper p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-dim">Tamanho</div>
                        <div className="mt-2 font-medium text-foreground">{pack.size} figurinhas</div>
                    </div>
                    <div className="album-paper p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-dim">Origem</div>
                        <div className="mt-2"><OriginBadge source={pack.source} label={sourceLabel(pack)} /></div>
                    </div>
                </div>

                {pack.activity_checkin_id ? (
                    <div className="album-paper p-3 text-sm text-foreground">
                        Check-in relacionado:{' '}
                        <Link className="underline" href={`/checkins/${pack.activity_checkin_id}`}>
                            #{pack.activity_checkin_id}
                        </Link>
                    </div>
                ) : null}

                {pack.status === 'pending' ? (
                    <section className="album-paper overflow-hidden p-4">
                        <p className="text-sm text-dim">Pacote fechado pronto para abertura.</p>
                        <div className="mt-3 p-4">
                            <div className={`collector-envelope relative mx-auto flex min-h-44 max-w-2xl items-center justify-center px-4 transition ${isOpening ? 'scale-[1.01] animate-pulse' : ''} motion-reduce:transform-none`}>
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-1 rounded-full border border-primary/35 bg-primary/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                                        <Sparkles className="size-3" /> Reveal AAPH
                                    </div>
                                    <div className="mt-3 text-xl font-semibold text-foreground">{pack.size} figurinhas da temporada</div>
                                    <div className="mt-1 text-xs text-dim">{isOpening ? 'Revelando pacote...' : 'Toque para abrir o envelope da rodada'}</div>
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="mt-3 inline-flex items-center gap-2 rounded-sm border border-primary bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                            onClick={openPack}
                            disabled={isOpening}
                        >
                            <Sparkles className="size-4" />
                            {isOpening ? 'Abrindo...' : 'Abrir pacote'}
                        </button>
                    </section>
                ) : null}

                {pack.status === 'cancelled' ? (
                    <section className="rounded-md border border-red-500/35 bg-red-500/10 p-4 text-sm">
                        <div className="font-medium text-red-700 dark:text-red-300">Pacote cancelado</div>
                        <div className="text-red-700/90 dark:text-red-200">Motivo: {pack.cancellation_reason ?? '-'}</div>
                    </section>
                ) : null}

                {pack.status === 'opened' ? (
                    <section className="album-paper p-4">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-sm font-semibold text-foreground">Figurinhas reveladas</h2>
                            <Link href="/album" className="text-xs underline">Ver no álbum</Link>
                        </div>
                        {pack.items.length === 0 ? (
                            <div className="mt-3">
                                <EmptyState title="Nenhuma figurinha registrada neste pacote." />
                            </div>
                        ) : (
                            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {pack.items.map((item, index) => {
                                    const delay = reducedMotion ? '0ms' : `${index * 80}ms`;
                                    const revealedNow = revealedIds.includes(item.sticker.id);

                                    return (
                                        <div
                                            key={item.id}
                                            className="relative overflow-hidden rounded-md border border-[color:var(--sticker-frame)] bg-[color:var(--sticker-surface)] p-3"
                                            style={{ animationDelay: delay }}
                                        >
                                            {revealedNow ? (
                                                <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-sm border border-[color:var(--brand-secondary)]/50 bg-[color:var(--brand-secondary)]/18 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-[color:var(--brand-secondary)] uppercase">
                                                    <Star className="size-3" /> Nova
                                                </span>
                                            ) : null}
                                            <div className="aspect-[3/4] overflow-hidden rounded-sm border border-[color:var(--sticker-frame)] bg-card">
                                                <img src={item.sticker.image_url} alt={item.sticker.title} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="mt-2 font-mono text-xs text-dim">{item.sticker.code}</div>
                                            <div className="mt-1 text-sm font-semibold text-foreground">{item.sticker.title}</div>
                                            <div className="text-xs text-dim">{item.sticker.type} • {item.sticker.rarity}</div>
                                            <div className="mt-2 flex items-center justify-between gap-2">
                                                <Link className="text-xs underline" href={`/album/stickers/${item.sticker.id}`}>
                                                    Ver no álbum
                                                </Link>
                                                {revealedNow ? (
                                                    <StatusBadge value="opened" label="Revelada agora" />
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                ) : null}
            </div>
        </>
    );
}
