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
        <div className="rounded-md border border-zinc-300 bg-zinc-900 p-3 text-zinc-100">
            <div className="mx-auto aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-md border border-zinc-700 bg-zinc-950">
                <div className="relative h-full p-5">
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_50%)]" />
                    <div className="relative z-10 flex h-full flex-col justify-between">
                        <div className="space-y-4">
                            <div className="inline-block rounded-sm border border-zinc-600 bg-zinc-900 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-300">
                                Álbum da Copa MAHA
                            </div>
                            <div className="inline-block rounded-sm border border-zinc-700 bg-zinc-900/80 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-300">
                                {seasonLabel}
                            </div>

                            <div className="space-y-1">
                                <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-400">Participante</div>
                                <div className="text-xl font-semibold leading-tight text-zinc-100">{userName}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-400">Temporada</div>
                                <div className="text-sm font-medium text-zinc-200">{albumName}</div>
                            </div>

                            <div className="rounded-sm border border-zinc-700 bg-zinc-900/80 p-3">
                                <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-400">Destaque</div>
                                <div className="mt-1 text-base font-semibold leading-tight text-zinc-100">{title}</div>
                                {subtitle ? <div className="mt-2 text-xs text-zinc-300">{subtitle}</div> : null}
                            </div>
                        </div>

                        <div className="space-y-2">
                            {metric !== null && metric !== undefined && metric !== '' ? (
                                <div className="rounded-sm border border-zinc-700 bg-zinc-900/80 p-3">
                                    <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-400">Métrica</div>
                                    <div className="text-3xl font-bold leading-none text-zinc-100">{metric}</div>
                                </div>
                            ) : null}

                            <div className="flex items-center justify-between border-t border-zinc-800 pt-2 text-[10px] uppercase tracking-[0.16em] text-zinc-400">
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
