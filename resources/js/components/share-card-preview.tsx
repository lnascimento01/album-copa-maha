import type { ReactNode } from 'react';

type Props = {
    payload: Record<string, unknown>;
    footer?: ReactNode;
};

export default function ShareCardPreview({ payload, footer }: Props) {
    const type = String(payload.type ?? 'share_card');
    const userName = String(payload.user_name ?? 'Participante AAPH');
    const albumName = String(payload.album_name ?? 'Álbum da temporada');
    const title = String(payload.title ?? 'Conquista AAPH');
    const subtitle = payload.subtitle ? String(payload.subtitle) : null;
    const metric = payload.metric as string | number | null | undefined;
    const date = String(payload.date ?? '');
    const seasonLabel = date ? `Temporada ${new Date(date).getFullYear()}` : 'Temporada AAPH';

    return (
        <div className="rounded-md border border-border bg-card p-3 text-foreground">
            <div className="mx-auto aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-md border border-[color:var(--pack-border)] bg-[color:var(--album-paper)]">
                <div className="relative h-full p-5">
                    <div className="absolute inset-0 opacity-40 brand-grid" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-primary" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 bg-[color:var(--brand-secondary)]" />

                    <div className="relative z-10 flex h-full flex-col justify-between text-foreground">
                        <div className="space-y-4">
                            <div className="inline-block rounded-sm border border-primary/35 bg-primary/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-primary">
                                Álbum da Copa AAPH
                            </div>
                            <div className="inline-block rounded-sm border border-[color:var(--brand-secondary)]/35 bg-[color:var(--brand-secondary)]/14 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--success)]">
                                {seasonLabel}
                            </div>

                            <div className="space-y-1">
                                <div className="text-[10px] uppercase tracking-[0.16em] text-dim">Participante</div>
                                <div className="text-xl font-semibold leading-tight text-foreground">{userName}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-[10px] uppercase tracking-[0.16em] text-dim">Álbum</div>
                                <div className="text-sm font-medium text-foreground">{albumName}</div>
                            </div>

                            <div className="rounded-sm border border-[color:var(--sticker-frame)] bg-[color:var(--sticker-surface)] p-3">
                                <div className="text-[10px] uppercase tracking-[0.16em] text-dim">Destaque</div>
                                <div className="mt-1 text-base font-semibold leading-tight text-foreground">{title}</div>
                                {subtitle ? <div className="mt-2 text-xs text-dim">{subtitle}</div> : null}
                            </div>
                        </div>

                        <div className="space-y-2">
                            {metric !== null && metric !== undefined && metric !== '' ? (
                                <div className="rounded-sm border border-[color:var(--aaph-blue)]/35 bg-primary/8 p-3">
                                    <div className="text-[10px] uppercase tracking-[0.16em] text-dim">Métrica</div>
                                    <div className="text-3xl font-bold leading-none text-foreground">{metric}</div>
                                </div>
                            ) : null}

                            <div className="flex items-center justify-between border-t border-border pt-2 text-[10px] uppercase tracking-[0.16em] text-dim">
                                <span>Presença, coleção e time.</span>
                                <span>{type.replace(/_/g, ' ')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {footer ? <div className="mt-3">{footer}</div> : null}
        </div>
    );
}
