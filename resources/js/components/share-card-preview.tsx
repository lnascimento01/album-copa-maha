import { Award, BarChart3, Megaphone, Package, Sparkles, Star, Sticker, Trophy } from 'lucide-react';
import { forwardRef   } from 'react';
import type {ComponentType, ReactNode} from 'react';

/** Export aspect ratios tuned per destination network. */
export type ShareCardFormat = 'story' | 'square' | 'portrait';

type Props = {
    payload: Record<string, unknown>;
    footer?: ReactNode;
    format?: ShareCardFormat;
};

type Accent = {
    label: string;
    color: string;
    Icon: ComponentType<{ className?: string }>;
};

type FormatStyle = {
    aspect: string;
    maxW: string;
    hero: string;
    pad: string;
    gap: string;
    logo: string;
};

const FORMAT_STYLES: Record<ShareCardFormat, FormatStyle> = {
    // Stories / status (Instagram Stories, WhatsApp Status, etc.).
    story: { aspect: 'aspect-[9/16]', maxW: 'max-w-[340px]', hero: 'text-[26px]', pad: 'p-5', gap: 'gap-3', logo: 'size-10' },
    // Instagram feed (portrait — best feed real estate).
    portrait: { aspect: 'aspect-[4/5]', maxW: 'max-w-[400px]', hero: 'text-[24px]', pad: 'p-4', gap: 'gap-2', logo: 'size-9' },
    // Instagram feed (square classic).
    square: { aspect: 'aspect-square', maxW: 'max-w-[440px]', hero: 'text-[22px]', pad: 'p-3', gap: 'gap-2', logo: 'size-8' },
};

const ACCENTS: Record<string, Accent> = {
    album_progress: { label: 'Progresso do álbum', color: '#60a5fa', Icon: BarChart3 },
    pack_opened: { label: 'Pacote aberto', color: '#a78bfa', Icon: Package },
    sticker_unlocked: { label: 'Figurinha desbloqueada', color: '#fbbf24', Icon: Sticker },
    achievement_unlocked: { label: 'Conquista desbloqueada', color: '#fcd34d', Icon: Award },
    social_mission_approved: { label: 'Missão aprovada', color: '#34d399', Icon: Trophy },
    social_mission: { label: 'Missão social', color: '#f59e0b', Icon: Megaphone },
    pool_active: { label: 'Bolão Copa 2026', color: '#f97316', Icon: Star },
};

const DEFAULT_ACCENT: Accent = { label: 'Álbum da Copa AAPH', color: '#8aa842', Icon: Sparkles };

/**
 * The visual share card. Self-contained, fixed (theme-independent) colors so
 * the rasterized PNG always looks vibrant in feeds — regardless of the user's
 * light/dark setting. The `format` prop switches the aspect ratio (stories vs
 * feed) while keeping the same layout. The forwarded ref points at the card
 * surface so it can be exported to an image (download / native share).
 */
const ShareCardPreview = forwardRef<HTMLDivElement, Props>(function ShareCardPreview({ payload, footer, format = 'story' }, ref) {
    const type = String(payload.type ?? 'share_card');
    const userName = String(payload.user_name ?? 'Participante AAPH');
    const albumName = String(payload.album_name ?? 'Álbum da temporada');
    const title = String(payload.title ?? 'Conquista AAPH');
    const subtitle = payload.subtitle ? String(payload.subtitle) : null;
    const metric = payload.metric as string | number | null | undefined;
    const date = String(payload.date ?? '');
    const seasonLabel = date ? `Temporada ${new Date(date).getFullYear()}` : 'Temporada AAPH';
    const stickerImageUrl = type === 'sticker_unlocked' && payload.image_url ? String(payload.image_url) : null;
    const isMission = type === 'social_mission';
    const isPool = type === 'pool_active';

    const styles = FORMAT_STYLES[format];
    const accent = ACCENTS[type] ?? DEFAULT_ACCENT;
    const AccentIcon = accent.Icon;
    const related = (payload.related ?? {}) as Record<string, unknown>;
    const percent = type === 'album_progress' ? Math.max(0, Math.min(100, Number(related.percent ?? metric ?? 0))) : null;
    const showMetric = percent === null && metric !== null && metric !== undefined && metric !== '';

    return (
        <div className="rounded-md border border-border bg-card p-3 text-foreground">
            <div
                ref={ref}
                className={`relative mx-auto ${styles.aspect} w-full ${styles.maxW} overflow-hidden rounded-[20px]`}
                style={{ background: 'linear-gradient(165deg, #102a4c 0%, #0a1a30 52%, #060f1d 100%)' }}
            >
                {/* Brand swooshes */}
                <div aria-hidden className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-16 -top-10 h-72 w-72 rotate-[18deg] rounded-full" style={{ background: 'radial-gradient(circle, rgba(138,168,66,0.30) 0%, transparent 70%)' }} />
                    <div className="absolute -bottom-16 -left-10 h-72 w-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(41,93,148,0.45) 0%, transparent 70%)' }} />
                    <div className="absolute inset-x-0 top-1/3 h-24 -skew-y-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.10), transparent)' }} />
                </div>

                {/* Accent top bar */}
                <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: accent.color }} />

                {stickerImageUrl ? (
                    /* ── Sticker card layout: image is the hero ── */
                    <div className={`relative z-10 flex h-full flex-col ${styles.gap} ${styles.pad} text-white`}>
                        {/* Header — never shrinks */}
                        <div className="flex shrink-0 items-start justify-between gap-2">
                            <div>
                                <div className="inline-block rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/85">
                                    Álbum da Copa AAPH
                                </div>
                                <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55">{seasonLabel}</div>
                            </div>
                            <img
                                src="/favicon.svg"
                                alt="AAPH"
                                className={`${styles.logo} shrink-0 rounded-full border border-white/25 bg-white object-contain p-1`}
                            />
                        </div>

                        {/* Accent badge — never shrinks */}
                        <div
                            className="shrink-0 inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                            style={{ color: '#0a1a30', background: accent.color }}
                        >
                            <AccentIcon className="size-3.5" />
                            {accent.label}
                        </div>

                        {/* Sticker image — flex takes remaining space; image fills without clipping */}
                        <div className="flex min-h-0 flex-1 items-center justify-center">
                            <img
                                src={stickerImageUrl}
                                alt={title}
                                className="block max-h-full w-auto max-w-full rounded-2xl object-contain"
                                style={{
                                    boxShadow: `0 0 0 3px ${accent.color}, 0 12px 40px rgba(0,0,0,0.55)`,
                                }}
                                crossOrigin="anonymous"
                            />
                        </div>

                        {/* Title below image — never shrinks */}
                        <div className="shrink-0 text-center">
                            <h2 className="text-lg font-black leading-tight tracking-tight text-white">{title}</h2>
                            {subtitle ? <p className="mt-0.5 text-[11px] font-medium text-white/70">{subtitle}</p> : null}
                        </div>

                        {/* Footer — never shrinks */}
                        <div className="shrink-0 space-y-1.5">
                            <div>
                                <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/50">Colecionador</div>
                                <div className="text-sm font-bold leading-tight text-white">{userName}</div>
                                <div className="text-[10px] text-white/55">{albumName}</div>
                            </div>
                            <div className="flex items-center justify-between border-t border-white/12 pt-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: accent.color }}>#CopaAAPH</span>
                                <span className="text-[10px] uppercase tracking-[0.12em] text-white/45">Presença · Coleção · Time</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ── Generic layout (no sticker image) ── */
                    <div className={`relative z-10 flex h-full flex-col justify-between ${styles.pad} text-white`}>
                        {/* Header */}
                        <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1.5">
                                    <div className="inline-block rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/85">
                                        Álbum da Copa AAPH
                                    </div>
                                    <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55">{seasonLabel}</div>
                                </div>
                                <img
                                    src="/favicon.svg"
                                    alt="AAPH"
                                    className="size-12 shrink-0 rounded-full border border-white/25 bg-white object-contain p-1"
                                />
                            </div>

                            <div
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                                style={{ color: '#0a1a30', background: accent.color }}
                            >
                                <AccentIcon className="size-3.5" />
                                {accent.label}
                            </div>
                        </div>

                        {/* Hero */}
                        <div className="space-y-3">
                            <div>
                                <h2 className={`${styles.hero} font-black leading-[1.05] tracking-tight text-white`}>{title}</h2>
                                {subtitle ? <p className="mt-1.5 text-sm font-medium text-white/75">{subtitle}</p> : null}
                            </div>

                            {percent !== null ? (
                                <div>
                                    <div className="flex items-end justify-between">
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">Coleção completa</span>
                                        <span className="text-4xl font-black leading-none" style={{ color: accent.color }}>{percent}%</span>
                                    </div>
                                    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
                                        <div className="h-full rounded-full" style={{ width: `${percent}%`, background: accent.color }} />
                                    </div>
                                </div>
                            ) : showMetric ? (
                                <div className="inline-flex items-baseline gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5">
                                    <span className="text-4xl font-black leading-none" style={{ color: accent.color }}>{metric}</span>
                                </div>
                            ) : null}
                        </div>

                        {/* Footer */}
                        <div className="space-y-3">
                            {isMission ? (
                                <div>
                                    <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/50">Como participar</div>
                                    <div className="text-lg font-bold leading-tight text-white">Envie sua evidência no app</div>
                                    <div className="text-[11px] text-white/55">{albumName}</div>
                                </div>
                            ) : isPool ? (
                                <div>
                                    <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/50">Como participar</div>
                                    <div className="text-lg font-bold leading-tight text-white">Acesse o app e faça seus palpites</div>
                                    <div className="text-[11px] text-white/55">{albumName}</div>
                                </div>
                            ) : (
                                <div>
                                    <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/50">Colecionador</div>
                                    <div className="text-lg font-bold leading-tight text-white">{userName}</div>
                                    <div className="text-[11px] text-white/55">{albumName}</div>
                                </div>
                            )}
                            <div className="flex items-center justify-between border-t border-white/12 pt-2.5">
                                <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: accent.color }}>#CopaAAPH</span>
                                <span className="text-[10px] uppercase tracking-[0.12em] text-white/45">Presença · Coleção · Time</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {footer ? <div className="mt-3">{footer}</div> : null}
        </div>
    );
});

export default ShareCardPreview;
