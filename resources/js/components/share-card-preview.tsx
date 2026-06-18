import { Award, BarChart3, Package, Sparkles, Sticker, Trophy } from 'lucide-react';
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
};

const FORMAT_STYLES: Record<ShareCardFormat, FormatStyle> = {
    // Stories / status (Instagram Stories, WhatsApp Status, etc.).
    story: { aspect: 'aspect-[9/16]', maxW: 'max-w-[340px]', hero: 'text-[26px]', pad: 'p-5' },
    // Instagram feed (portrait — best feed real estate).
    portrait: { aspect: 'aspect-[4/5]', maxW: 'max-w-[400px]', hero: 'text-[24px]', pad: 'p-5' },
    // Instagram feed (square classic).
    square: { aspect: 'aspect-square', maxW: 'max-w-[440px]', hero: 'text-[22px]', pad: 'p-4' },
};

const ACCENTS: Record<string, Accent> = {
    album_progress: { label: 'Progresso do álbum', color: '#60a5fa', Icon: BarChart3 },
    pack_opened: { label: 'Pacote aberto', color: '#a78bfa', Icon: Package },
    sticker_unlocked: { label: 'Figurinha desbloqueada', color: '#fbbf24', Icon: Sticker },
    achievement_unlocked: { label: 'Conquista desbloqueada', color: '#fcd34d', Icon: Award },
    social_mission_approved: { label: 'Missão aprovada', color: '#34d399', Icon: Trophy },
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
                {/* Brand swooshes (Brazil/sticker motif) — pure CSS so it rasterizes cleanly */}
                <div aria-hidden className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-16 -top-10 h-72 w-72 rotate-[18deg] rounded-full" style={{ background: 'radial-gradient(circle, rgba(138,168,66,0.30) 0%, transparent 70%)' }} />
                    <div className="absolute -bottom-16 -left-10 h-72 w-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(41,93,148,0.45) 0%, transparent 70%)' }} />
                    <div className="absolute inset-x-0 top-1/3 h-24 -skew-y-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.10), transparent)' }} />
                </div>

                {/* Accent top bar */}
                <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: accent.color }} />

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
                        <div>
                            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/50">Colecionador</div>
                            <div className="text-lg font-bold leading-tight text-white">{userName}</div>
                            <div className="text-[11px] text-white/55">{albumName}</div>
                        </div>
                        <div className="flex items-center justify-between border-t border-white/12 pt-2.5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: accent.color }}>#CopaAAPH</span>
                            <span className="text-[10px] uppercase tracking-[0.12em] text-white/45">Presença · Coleção · Time</span>
                        </div>
                    </div>
                </div>
            </div>

            {footer ? <div className="mt-3">{footer}</div> : null}
        </div>
    );
});

export default ShareCardPreview;
