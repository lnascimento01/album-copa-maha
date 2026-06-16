import { Head, Link, router, usePage } from '@inertiajs/react';
import { Sparkles, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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

// Persists across Inertia in-place prop update AND component remount.
// Set just before the POST fires; consumed by the new/updated instance.
let _doReveal = false;

// Stable empty array — avoids new reference on every render when flash is null.
const EMPTY_IDS: number[] = [];

const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

const RARITY_COLORS = {
    common:    { label: 'Comum',    color: '#9ca3af', rgb: '156,163,175' },
    rare:      { label: 'Raro',     color: '#60a5fa', rgb: '96,165,250'  },
    epic:      { label: 'Épico',    color: '#c084fc', rgb: '192,132,252' },
    legendary: { label: 'Lendário', color: '#fbbf24', rgb: '251,191,36'  },
} as const;

export default function PackShow({ pack }: { pack: Pack }) {
    const page = usePage<{ flash?: Flash }>();
    const revealedIds = page.props.flash?.revealedStickerIds ?? EMPTY_IDS;
    const [isOpening, setIsOpening] = useState(false);
    const [showCinema, setShowCinema] = useState(() => revealedIds.length > 0);

    // Curtain transition state — picks up _doReveal flag on remount
    const [curtain, setCurtain] = useState<'idle' | 'closing' | 'revealing'>(() => {
        if (_doReveal) { _doReveal = false; return 'revealing'; }
        return 'idle';
    });

    const reducedMotion = useMemo(
        () => (typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false),
        [],
    );

    // Auto-clear the "revealing" phase once the curtain has opened
    useEffect(() => {
        if (curtain !== 'revealing') return;
        const t = setTimeout(() => setCurtain('idle'), 800);
        return () => clearTimeout(t);
    }, [curtain]);

    // In-place update: when revealedIds arrives from flash, show cinema
    useEffect(() => {
        if (revealedIds.length > 0) {
            setShowCinema(true);
        }
    }, [revealedIds]);

    // In-place update: when pack opens while curtains are still closing, advance to reveal
    useEffect(() => {
        if (pack.status === 'opened' && curtain === 'closing') {
            setCurtain('revealing');
        }
    }, [pack.status, curtain]);

    // Order items by the reveal sequence from flash
    const cinemaItems = useMemo(() => {
        if (!revealedIds.length) return [];

        const order = new Map(revealedIds.map((id, i) => [id, i]));

        return pack.items
            .filter(item => order.has(item.sticker.id))
            .sort((a, b) => (order.get(a.sticker.id) ?? 0) - (order.get(b.sticker.id) ?? 0));
    }, [pack.items, revealedIds]);

    const openPack = () => {
        if (isOpening) return;
        setIsOpening(true);

        if (reducedMotion) {
            router.post(`/packs/${pack.id}/open`, {}, { preserveScroll: true });
            return;
        }

        // Close curtains first, then fire the POST
        setCurtain('closing');
        setTimeout(() => {
            _doReveal = true;
            router.post(
                `/packs/${pack.id}/open`,
                {},
                {
                    preserveScroll: true,
                    onError: () => {
                        _doReveal = false;
                        setIsOpening(false);
                        setCurtain('idle');
                    },
                },
            );
        }, 580);
    };

    return (
        <>
            <Head title={`Pacote #${pack.id}`} />

            {/* ── Curtain transition overlay (z-60 > cinema z-50) ── */}
            {curtain !== 'idle' && !reducedMotion && (
                <div
                    aria-hidden
                    className="pointer-events-none fixed inset-0 overflow-hidden"
                    style={{ zIndex: 60 }}
                >
                    {/* Left panel */}
                    <div
                        className="absolute left-0 top-0 h-full w-[51%]"
                        style={{
                            background: 'linear-gradient(to right, #030209 0%, #0d0a20 70%, #161340 100%)',
                            borderRight: '1px solid rgba(99,102,241,0.18)',
                            animation: curtain === 'closing'
                                ? 'curtain-close-left 0.58s cubic-bezier(0.76,0,0.24,1) both'
                                : 'curtain-open-left 0.72s cubic-bezier(0.76,0,0.24,1) both',
                        }}
                    />
                    {/* Right panel */}
                    <div
                        className="absolute right-0 top-0 h-full w-[51%]"
                        style={{
                            background: 'linear-gradient(to left, #030209 0%, #0d0a20 70%, #161340 100%)',
                            borderLeft: '1px solid rgba(99,102,241,0.18)',
                            animation: curtain === 'closing'
                                ? 'curtain-close-right 0.58s cubic-bezier(0.76,0,0.24,1) both'
                                : 'curtain-open-right 0.72s cubic-bezier(0.76,0,0.24,1) both',
                        }}
                    />
                    {/* Waiting indicator shown only while curtains are closed */}
                    {curtain === 'closing' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles
                                className="size-9 text-indigo-400/35"
                                style={{ animation: 'spin-slow 2s linear infinite' }}
                            />
                        </div>
                    )}
                </div>
            )}

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

                {/* ── OPENED: cinematic sticker grid (unmounted while cinema is active) ── */}
                {pack.status === 'opened' && !showCinema ? (
                    <section className="space-y-4">
                        {/* Celebration hero */}
                        <div
                            className="relative overflow-hidden rounded-xl"
                            style={{ background: 'linear-gradient(145deg, #0a0818 0%, #161340 55%, #0a0818 100%)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            <div
                                aria-hidden
                                className="absolute inset-0 opacity-[0.06]"
                                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                            />
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
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                                                boxShadow: revealedNow ? `0 0 28px 4px rgba(${rc.rgb}, 0.22)` : 'none',
                                                animation: reducedMotion ? 'none' : 'sticker-enter 0.5s ease both',
                                                animationDelay: delay,
                                            }}
                                        >
                                            {/* "Nova" badge overlaid on image */}
                                            {revealedNow && (
                                                <span className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded-md border border-emerald-500/50 bg-emerald-950/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-400 backdrop-blur-sm">
                                                    <Star className="size-2.5" aria-hidden /> Nova
                                                </span>
                                            )}

                                            {/* Full sticker image — object-contain preserves the complete card design */}
                                            <div className="w-full bg-black/20">
                                                <img
                                                    src={item.sticker.image_url}
                                                    alt={item.sticker.title}
                                                    className="w-full transition-transform duration-500 group-hover:scale-[1.03]"
                                                    style={{ display: 'block' }}
                                                />
                                            </div>

                                            {/* Minimal footer — rarity + action */}
                                            <div
                                                className="flex items-center justify-between gap-2 px-3 py-2.5"
                                                style={{ borderTop: `1px solid rgba(${rc.rgb}, 0.15)` }}
                                            >
                                                <span
                                                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                                                    style={{ color: rc.color }}
                                                >
                                                    {item.sticker.rarity === 'legendary' && <Star className="size-2.5" aria-hidden />}
                                                    {rc.label}
                                                </span>
                                                <Link
                                                    href={`/album/stickers/${item.sticker.id}`}
                                                    className="text-[11px] font-semibold text-white/35 transition-colors hover:text-white/70"
                                                >
                                                    Ver no álbum →
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
