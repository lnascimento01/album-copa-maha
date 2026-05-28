import type { ReactNode } from 'react';

type Props = {
    payload: Record<string, unknown>;
    footer?: ReactNode;
};

export default function ShareCardPreview({ payload, footer }: Props) {
    const type = String(payload.type ?? 'share_card');
    const userName = String(payload.user_name ?? 'Participante MAHA');
    const albumName = String(payload.album_name ?? 'Álbum da temporada');
    const title = String(payload.title ?? 'Conquista MAHA');
    const subtitle = payload.subtitle ? String(payload.subtitle) : null;
    const metric = payload.metric as string | number | null | undefined;
    const date = String(payload.date ?? '');
    const seasonLabel = date ? `Temporada ${new Date(date).getFullYear()}` : 'Temporada MAHA';

    return (
        <div className="rounded-md border border-border bg-card p-3 text-foreground">
            <div className="mx-auto aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-md border border-primary/25 bg-[#0c1f35]">
                <div className="relative h-full p-5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,169,67,0.18),transparent_42%),linear-gradient(145deg,rgba(42,93,148,0.25),rgba(7,17,31,0.86))]" />
                    <div className="absolute inset-0 opacity-25 brand-grid" />

                    <div className="relative z-10 flex h-full flex-col justify-between text-slate-100">
                        <div className="space-y-4">
                            <div className="inline-block rounded-sm border border-slate-400/40 bg-slate-900/35 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-100">
                                Álbum da Copa MAHA
                            </div>
                            <div className="inline-block rounded-sm border border-slate-400/40 bg-slate-900/35 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-200">
                                {seasonLabel}
                            </div>

                            <div className="space-y-1">
                                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-300">Participante</div>
                                <div className="text-xl font-semibold leading-tight text-white">{userName}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-300">Álbum</div>
                                <div className="text-sm font-medium text-slate-100">{albumName}</div>
                            </div>

                            <div className="rounded-sm border border-slate-400/40 bg-slate-900/40 p-3">
                                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-300">Destaque</div>
                                <div className="mt-1 text-base font-semibold leading-tight text-white">{title}</div>
                                {subtitle ? <div className="mt-2 text-xs text-slate-200">{subtitle}</div> : null}
                            </div>
                        </div>

                        <div className="space-y-2">
                            {metric !== null && metric !== undefined && metric !== '' ? (
                                <div className="rounded-sm border border-slate-400/40 bg-slate-900/40 p-3">
                                    <div className="text-[10px] uppercase tracking-[0.16em] text-slate-300">Métrica</div>
                                    <div className="text-3xl font-bold leading-none text-white">{metric}</div>
                                </div>
                            ) : null}

                            <div className="flex items-center justify-between border-t border-slate-500/35 pt-2 text-[10px] uppercase tracking-[0.16em] text-slate-300">
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
