import { ChevronRight, Sparkles, Star } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Sticker = {
    id: number;
    code: string;
    title: string;
    subtitle: string | null;
    type: string;
    rarity: string;
    image_url: string;
};

export type CinemaPackItem = { id: number; sticker: Sticker };

type Phase = 'waiting' | 'flipping' | 'revealed';

const RARITY = {
    common: { label: 'Comum', color: '#9ca3af', rgb: '156,163,175', particles: 7, autoMs: 2400 },
    rare: { label: 'Raro', color: '#60a5fa', rgb: '96,165,250', particles: 14, autoMs: 2900 },
    epic: { label: 'Épico', color: '#c084fc', rgb: '192,132,252', particles: 22, autoMs: 3600 },
    legendary: { label: 'Lendário', color: '#fbbf24', rgb: '251,191,36', particles: 32, autoMs: 4800 },
} as const;

type RarityKey = keyof typeof RARITY;

function rarityConfig(rarity: string) {
    return RARITY[(rarity as RarityKey) in RARITY ? (rarity as RarityKey) : 'common'];
}

interface Props {
    items: CinemaPackItem[];
    onDone: () => void;
    reducedMotion?: boolean;
}

export function PackRevealCinema({ items, onDone, reducedMotion = false }: Props) {
    const [idx, setIdx] = useState(0);
    const [phase, setPhase] = useState<Phase>('waiting');
    const [showParticles, setShowParticles] = useState(false);
    const [flashActive, setFlashActive] = useState(false);
    const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const item = items[idx];
    const cfg = rarityConfig(item?.sticker.rarity ?? 'common');
    const isLast = idx >= items.length - 1;

    // Deterministic particle positions — stable per card, no Math.random() in render
    const particles = useMemo(() => {
        const n = cfg.particles;

        return Array.from({ length: n }, (_, i) => {
            const angle = (i / n) * 360 + ((i * 37) % 30) - 15;
            const dist = 68 + ((i * 53) % 110);
            const delay = (i * 71) % 380;
            const size = 3 + ((i * 11) % 7);
            const rad = (angle * Math.PI) / 180;

            return { id: i, x: Math.cos(rad) * dist, y: Math.sin(rad) * dist, delay, size };
        });
    }, [cfg.particles]);

    const stopAuto = useCallback(() => {
        if (autoTimer.current) {
 clearTimeout(autoTimer.current); autoTimer.current = null; 
}
    }, []);

    const advance = useCallback(() => {
        stopAuto();
        setShowParticles(false);
        setFlashActive(false);

        if (isLast) {
 onDone(); 
} else {
 setIdx(i => i + 1); setPhase('waiting'); 
}
    }, [isLast, onDone, stopAuto]);

    const reveal = useCallback(() => {
        if (phase !== 'waiting') {
return;
}

        if (reducedMotion) {
            setPhase('revealed');
            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 700);

            return;
        }

        setPhase('flipping');
        setTimeout(() => {
            setPhase('revealed');
            setShowParticles(true);
            const r = item?.sticker.rarity;

            if (r === 'epic' || r === 'legendary') {
                setFlashActive(true);
                setTimeout(() => setFlashActive(false), 720);
            }

            setTimeout(() => setShowParticles(false), 1100);
        }, 330);
    }, [phase, reducedMotion, item?.sticker.rarity]);

    const handleClick = useCallback(() => {
        if (phase === 'waiting') {
reveal();
} else if (phase === 'revealed') {
advance();
}
    }, [phase, reveal, advance]);

    useEffect(() => {
        if (phase === 'revealed') {
            autoTimer.current = setTimeout(advance, cfg.autoMs);
        }

        return stopAuto;
    }, [phase, cfg.autoMs, advance, stopAuto]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Enter') {
 e.preventDefault(); handleClick(); 
}

            if (e.key === 'Escape') {
onDone();
}
        };
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [handleClick, onDone]);

    if (!item) {
return null;
}

    const isFlipped = phase !== 'waiting';
    const isRevealed = phase === 'revealed';

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden select-none cursor-pointer"
            style={{
                background: isRevealed
                    ? `radial-gradient(ellipse 90% 70% at 50% 50%, rgba(${cfg.rgb}, 0.16) 0%, #050508 62%)`
                    : 'radial-gradient(ellipse 75% 60% at 50% 50%, #161340 0%, #050508 68%)',
                transition: reducedMotion ? 'none' : 'background 0.75s ease',
            }}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            aria-label={isRevealed ? 'Próxima figurinha' : 'Revelar figurinha'}
        >
            {/* Epic/legendary white flash */}
            {flashActive && (
                <div
                    aria-hidden
                    className="pointer-events-none fixed inset-0 z-20"
                    style={{ backgroundColor: cfg.color, animation: 'cinema-flash 0.72s ease-out forwards' }}
                />
            )}

            {/* Ambient breathe glow on reveal */}
            {isRevealed && !reducedMotion && (
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background: `radial-gradient(ellipse 60% 45% at 50% 46%, rgba(${cfg.rgb}, 0.24) 0%, transparent 72%)`,
                        animation: 'bg-breathe 2.6s ease-in-out infinite',
                    }}
                />
            )}

            {/* Progress bar dots */}
            <div
                className="mb-6 flex items-center gap-2"
                aria-label={`Figurinha ${idx + 1} de ${items.length}`}
                aria-live="polite"
            >
                {items.map((_, i) => (
                    <div
                        key={i}
                        className="rounded-full"
                        style={{
                            height: 4,
                            width: i === idx ? 24 : 7,
                            backgroundColor: i < idx ? '#4ade80' : i === idx ? '#ffffff' : '#1c1b38',
                            transition: reducedMotion ? 'none' : 'all 0.35s ease',
                        }}
                    />
                ))}
            </div>

            {/* Card zone */}
            <div className="relative flex items-center justify-center">
                {/* Waiting pulse rings */}
                {!isRevealed && !reducedMotion && (
                    <>
                        <div
                            aria-hidden
                            className="absolute rounded-[20px]"
                            style={{
                                width: 224, height: 300,
                                border: '2px solid rgba(255,255,255,0.1)',
                                animation: 'pulse-ring 2.2s ease-out infinite',
                            }}
                        />
                        <div
                            aria-hidden
                            className="absolute rounded-[20px]"
                            style={{
                                width: 224, height: 300,
                                border: '2px solid rgba(255,255,255,0.05)',
                                animation: 'pulse-ring 2.2s ease-out 1.1s infinite',
                            }}
                        />
                    </>
                )}

                {/* Particles */}
                {showParticles && !reducedMotion && (
                    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        {particles.map(p => (
                            <div
                                key={p.id}
                                className="absolute rounded-full"
                                style={{
                                    width: p.size,
                                    height: p.size,
                                    left: '50%',
                                    top: '50%',
                                    backgroundColor: cfg.color,
                                    boxShadow: `0 0 ${p.size * 2}px ${p.size}px ${cfg.color}55`,
                                    animation: `particle-fly 0.9s ease-out ${p.delay}ms both`,
                                    '--tx': `${p.x}px`,
                                    '--ty': `${p.y}px`,
                                } as React.CSSProperties}
                            />
                        ))}
                    </div>
                )}

                {/* 3-D card */}
                <div style={{ width: 224, height: 300, perspective: 900 }}>
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            transformStyle: 'preserve-3d',
                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                            transition: reducedMotion ? 'none' : 'transform 0.66s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        }}
                    >
                        {/* ── BACK ── */}
                        <div
                            className="absolute inset-0 rounded-[18px] overflow-hidden"
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                background: 'linear-gradient(148deg, #1d1a50 0%, #302b78 50%, #1a1644 100%)',
                                boxShadow: '0 28px 58px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07) inset',
                            }}
                        >
                            {/* Dot grid */}
                            <div
                                aria-hidden
                                className="absolute inset-0 opacity-[0.065]"
                                style={{
                                    backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                                    backgroundSize: '14px 14px',
                                }}
                            />
                            {/* Center emblem */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                <div
                                    className="flex h-14 w-14 items-center justify-center rounded-full"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.13)',
                                        boxShadow: '0 0 22px rgba(99,102,241,0.35)',
                                    }}
                                >
                                    <Sparkles
                                        className="size-7 text-indigo-300/55"
                                        aria-hidden
                                        style={reducedMotion ? {} : { animation: 'spin-slow 4s linear infinite' }}
                                    />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.38em] text-white/22">
                                    MAHA COPA
                                </span>
                            </div>
                            {/* Shimmer sweep */}
                            {!reducedMotion && (
                                <div
                                    aria-hidden
                                    className="absolute inset-0 rounded-[18px]"
                                    style={{
                                        background: 'linear-gradient(105deg, transparent 28%, rgba(255,255,255,0.075) 50%, transparent 72%)',
                                        backgroundSize: '200% 100%',
                                        animation: 'card-shimmer 3s ease-in-out infinite',
                                    }}
                                />
                            )}
                        </div>

                        {/* ── FRONT ── */}
                        <div
                            className="absolute inset-0 rounded-[18px] overflow-hidden"
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                                border: `2px solid ${cfg.color}`,
                                boxShadow: isRevealed
                                    ? `0 0 0 2px ${cfg.color}, 0 0 32px 8px rgba(${cfg.rgb}, 0.55), 0 28px 56px rgba(0,0,0,0.55)`
                                    : '0 28px 56px rgba(0,0,0,0.55)',
                                transition: reducedMotion ? 'none' : 'box-shadow 0.5s ease 0.2s',
                            }}
                        >
                            {item.sticker.image_url ? (
                                <img
                                    src={item.sticker.image_url}
                                    alt={item.sticker.title}
                                    className="h-full w-full object-cover"
                                    loading="eager"
                                />
                            ) : (
                                <div
                                    className="flex h-full w-full flex-col items-center justify-center gap-3"
                                    style={{ background: `linear-gradient(145deg, rgba(${cfg.rgb},0.28), rgba(${cfg.rgb},0.08))` }}
                                >
                                    <Star className="size-10 text-white/30" aria-hidden />
                                    <span className="font-mono text-xs text-white/30">{item.sticker.code}</span>
                                </div>
                            )}
                            {/* Epic / legendary shimmer overlay */}
                            {isRevealed && (item.sticker.rarity === 'epic' || item.sticker.rarity === 'legendary') && !reducedMotion && (
                                <div
                                    aria-hidden
                                    className="absolute inset-0"
                                    style={{
                                        background: `linear-gradient(135deg, transparent 15%, rgba(${cfg.rgb},0.3) 42%, transparent 55%, rgba(${cfg.rgb},0.12) 82%)`,
                                        backgroundSize: '300% 300%',
                                        animation: 'legendary-shimmer 2.5s ease-in-out infinite',
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Revealed sticker info */}
            <div
                className="mt-5 text-center"
                style={{
                    opacity: isRevealed ? 1 : 0,
                    transform: isRevealed ? 'translateY(0)' : 'translateY(14px)',
                    transition: reducedMotion ? 'none' : 'opacity 0.45s ease 0.28s, transform 0.45s ease 0.28s',
                    minHeight: 80,
                }}
            >
                <div
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]"
                    style={{
                        color: cfg.color,
                        backgroundColor: `rgba(${cfg.rgb}, 0.14)`,
                        border: `1px solid rgba(${cfg.rgb}, 0.38)`,
                    }}
                >
                    {item.sticker.rarity === 'legendary' && <Star className="size-3" aria-hidden />}
                    {cfg.label}
                </div>
                <div className="mt-2.5 text-base font-bold tracking-wide text-white">
                    {item.sticker.title}
                </div>
                {item.sticker.subtitle && (
                    <div className="mt-0.5 text-xs text-white/40">{item.sticker.subtitle}</div>
                )}
                <div className="mt-1 font-mono text-[10px] text-white/20">{item.sticker.code}</div>
            </div>

            {/* Hint */}
            <div className="mt-7 text-center" style={{ minHeight: 28 }}>
                {phase === 'waiting' && (
                    <p
                        className="text-sm text-white/30"
                        style={reducedMotion ? {} : { animation: 'bg-breathe 2s ease-in-out infinite' }}
                    >
                        Toque para revelar
                        <span className="ml-2 text-white/15">{idx + 1} / {items.length}</span>
                    </p>
                )}
                {isRevealed && (
                    <p className="inline-flex items-center gap-1 text-xs text-white/22">
                        {isLast ? 'Toque para finalizar' : 'Toque para continuar'}
                        <ChevronRight className="size-3" aria-hidden />
                    </p>
                )}
            </div>

            {/* Skip */}
            <button
                type="button"
                className="absolute right-5 bottom-5 rounded-full px-4 py-2 text-xs text-white/22 transition-all hover:bg-white/5 hover:text-white/50"
                onClick={e => {
 e.stopPropagation(); onDone(); 
}}
                aria-label="Pular animação"
            >
                Pular →
            </button>
        </div>
    );
}
