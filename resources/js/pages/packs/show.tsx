import { Head, Link, router, usePage } from '@inertiajs/react';
import { Sparkles, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PackRevealCinema } from '@/components/packs/pack-reveal-cinema';
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
return `Código: ${pack.reward_code.code}`;
}

    if (pack.source === 'social_mission' && pack.social_mission) {
return `Missão: ${pack.social_mission.title}`;
}

    return 'Concessão manual';
}

const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

const RARITY_COLORS = {
    common:    { label: 'Comum',    color: '#9ca3af', rgb: '156,163,175' },
    rare:      { label: 'Raro',     color: '#60a5fa', rgb: '96,165,250'  },
    epic:      { label: 'Épico',    color: '#c084fc', rgb: '192,132,252' },
    legendary: { label: 'Lendário', color: '#fbbf24', rgb: '251,191,36'  },
} as const;

export default function PackShow({ pack }: { pack: Pack }) {
    const page = usePage<{ flash?: Flash }>();
    const revealedIds = useMemo(
        () => page.props.flash?.revealedStickerIds ?? [],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );
    const [isOpening, setIsOpening] = useState(false);
    const [showCinema, setShowCinema] = useState(() => revealedIds.length > 0);

    const reducedMotion = useMemo(
        () => (typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false),
        [],
    );

    // Order items by the reveal sequence from flash
    const cinemaItems = useMemo(() => {
        if (!revealedIds.length) {
return [];
}

        const order = new Map(revealedIds.map((id, i) => [id, i]));

        return pack.items
            .filter(item => order.has(item.sticker.id))
            .sort((a, b) => (order.get(a.sticker.id) ?? 0) - (order.get(b.sticker.id) ?? 0));
    }, [pack.items, revealedIds]);

    const openPack = () => {
        if (isOpening) {
return;
}

        setIsOpening(true);
        router.post(
            `/packs/${pack.id}/open`,
            {},
            { preserveScroll: true, onFinish: () => setIsOpening(false) },
        );
    };

    return (
        <>
            <Head title={`Pacote #${pack.id}`} />

            {/* ── Cinema reveal overlay ── */}
            {showCinema && cinemaItems.length > 0 && (
                <PackRevealCinema
                    items={cinemaItems}
                    onDone={() => setShowCinema(false)}
                    reducedMotion={reducedMotion}
                />
            )}

            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader
                    title={`Pacote #${pack.id}`}
                    subtitle="Revelação da rodada e histórico das figurinhas entregues."
                    actions={
                        <Link href="/packs" className="rounded-sm border border-border bg-card px-3 py-2 text-xs font-semibold">
                            Voltar para pacotes
                        </Link>
                    }
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

                {/* ── PENDING: cinematic pack reveal area ── */}
                {pack.status === 'pending' ? (
                    <section
                        className="overflow-hidden rounded-xl"
                        style={{ background: '#050508', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        {/* Light-ray stage */}
                        <div className="relative flex min-h-64 items-center justify-center overflow-hidden py-10">
                            {/* Animated rays */}
                            {!reducedMotion &&
                                RAY_ANGLES.map((deg, i) => (
                                    <div
                                        key={deg}
                                        aria-hidden
                                        className="absolute origin-bottom"
                                        style={{
                                            width: 2,
                                            height: '46%',
                                            bottom: '50%',
                                            left: '50%',
                                            marginLeft: -1,
                                            background: 'linear-gradient(to top, rgba(99,102,241,0.5) 0%, transparent 100%)',
                                            transformOrigin: 'bottom center',
                                            '--ray-deg': `${deg}deg`,
                                            animation: `pack-ray 3.5s ease-in-out ${i * 437}ms infinite`,
                                        } as React.CSSProperties}
                                    />
                                ))}

                            {/* Glowing envelope */}
                            <div
                                className="relative z-10"
                                style={isOpening && !reducedMotion ? { animation: 'pack-shake 0.55s ease-in-out' } : {}}
                            >
                                <div
                                    className="collector-envelope flex h-44 w-64 flex-col items-center justify-center gap-4 rounded-2xl"
                                    style={
                                        !isOpening && !reducedMotion
                                            ? { animation: 'glow-pulse-pack 2.8s ease-in-out infinite' }
                                            : {}
                                    }
                                >
                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                                        <Sparkles className="size-3" aria-hidden />
                                        Reveal
                                    </div>
                                    <div className="text-xl font-bold text-foreground">{pack.size} figurinhas</div>
                                    <div className="text-[11px] text-dim">
                                        {isOpening ? 'Preparando revelação…' : 'Clique para abrir o envelope'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-4 border-t border-white/[0.06] px-5 py-4">
                            <button
                                type="button"
                                onClick={openPack}
                                disabled={isOpening}
                                className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60"
                                style={!isOpening ? { boxShadow: '0 0 18px rgba(99,102,241,0.4)' } : {}}
                            >
                                <Sparkles className="size-4" aria-hidden />
                                {isOpening ? 'Abrindo…' : 'Abrir Pacote'}
                            </button>
                            <span className="text-xs text-white/20">{sourceLabel(pack)}</span>
                        </div>
                    </section>
                ) : null}

                {/* ── CANCELLED ── */}
                {pack.status === 'cancelled' ? (
                    <section className="rounded-md border border-red-500/35 bg-red-500/10 p-4 text-sm">
                        <div className="font-medium text-red-700 dark:text-red-300">Pacote cancelado</div>
                        <div className="text-red-700/90 dark:text-red-200">Motivo: {pack.cancellation_reason ?? '-'}</div>
                    </section>
                ) : null}

                {/* ── OPENED: cinematic sticker grid (hidden while cinema overlay is active) ── */}
                {pack.status === 'opened' && !showCinema ? (
                    <section className="space-y-4">
                        {/* Celebration hero */}
                        <div
                            className="relative overflow-hidden rounded-xl"
                            style={{ background: 'linear-gradient(145deg, #0a0818 0%, #161340 55%, #0a0818 100%)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            {/* Star-field dots */}
                            <div
                                aria-hidden
                                className="absolute inset-0 opacity-[0.06]"
                                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                            />
                            {/* Soft glow */}
                            <div
                                aria-hidden
                                className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
                                style={{ width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)' }}
                            />

                            <div className="relative z-10 flex flex-col items-center gap-3 px-6 py-8 text-center">
                                <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-300">
                                    <Sparkles className="size-3" aria-hidden />
                                    Pacote aberto
                                </div>
                                <h2 className="text-2xl font-bold text-white">
                                    {pack.items.length} figurinha{pack.items.length !== 1 ? 's' : ''} revelada{pack.items.length !== 1 ? 's' : ''}!
                                </h2>
                                <p className="text-sm text-white/40">{sourceLabel(pack)}</p>

                                <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                                    {revealedIds.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowCinema(true)}
                                            className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/6 px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                                        >
                                            <Sparkles className="size-3.5" aria-hidden />
                                            Rever animação
                                        </button>
                                    )}
                                    <Link
                                        href="/album"
                                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110"
                                        style={{ boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}
                                    >
                                        Ver no álbum
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Sticker grid */}
                        {pack.items.length === 0 ? (
                            <EmptyState title="Nenhuma figurinha registrada neste pacote." />
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {pack.items.map((item, index) => {
                                    const delay = reducedMotion ? '0ms' : `${index * 90}ms`;
                                    const revealedNow = revealedIds.includes(item.sticker.id);
                                    const rc = RARITY_COLORS[item.sticker.rarity as keyof typeof RARITY_COLORS] ?? RARITY_COLORS.common;

                                    return (
                                        <div
                                            key={item.id}
                                            className="group relative overflow-hidden rounded-xl"
                                            style={{
                                                background: '#0c0a1a',
                                                border: `1.5px solid rgba(${rc.rgb}, ${revealedNow ? 0.6 : 0.25})`,
                                                boxShadow: revealedNow ? `0 0 22px 2px rgba(${rc.rgb}, 0.25)` : 'none',
                                                animation: reducedMotion ? 'none' : 'sticker-enter 0.5s ease both',
                                                animationDelay: delay,
                                            }}
                                        >
                                            {/* Sticker image full-width */}
                                            <div className="aspect-[3/4] w-full overflow-hidden">
                                                <img
                                                    src={item.sticker.image_url}
                                                    alt={item.sticker.title}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>

                                            {/* Info strip */}
                                            <div className="px-3 pb-3 pt-2.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span
                                                        className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
                                                        style={{ color: rc.color, background: `rgba(${rc.rgb}, 0.14)`, border: `1px solid rgba(${rc.rgb}, 0.3)` }}
                                                    >
                                                        {item.sticker.rarity === 'legendary' && <Star className="size-2.5" aria-hidden />}
                                                        {rc.label}
                                                    </span>
                                                    {revealedNow && (
                                                        <span className="inline-flex items-center gap-1 rounded-sm border border-emerald-500/40 bg-emerald-500/14 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-400">
                                                            <Star className="size-2.5" aria-hidden /> Nova
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-1.5 font-mono text-[10px] text-white/20">{item.sticker.code}</div>
                                                <div className="mt-0.5 text-sm font-bold text-white">{item.sticker.title}</div>
                                                {item.sticker.subtitle && (
                                                    <div className="text-xs text-white/40">{item.sticker.subtitle}</div>
                                                )}

                                                <Link
                                                    href={`/album/stickers/${item.sticker.id}`}
                                                    className="mt-2.5 block rounded-md border border-white/10 py-1.5 text-center text-[11px] font-semibold text-white/50 transition-colors hover:border-white/22 hover:text-white/80"
                                                >
                                                    Ver no álbum
                                                </Link>
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
