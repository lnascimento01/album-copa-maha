import { Head, Link, router, usePage } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
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
            <div className="space-y-4 p-4 sm:p-5">
                <PageHeader
                    title={`Pacote #${pack.id}`}
                    subtitle="Detalhe do pacote recebido e histórico das figurinhas reveladas."
                    actions={<Link href="/packs" className="rounded-sm border border-border bg-card px-3 py-2 text-xs">Voltar para pacotes</Link>}
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-md border border-border bg-card p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-dim">Status</div>
                        <div className="mt-2"><StatusBadge value={pack.status} /></div>
                    </div>
                    <div className="rounded-md border border-border bg-card p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-dim">Álbum</div>
                        <div className="mt-2 font-medium text-foreground">{pack.album.name}</div>
                    </div>
                    <div className="rounded-md border border-border bg-card p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-dim">Tamanho</div>
                        <div className="mt-2 font-medium text-foreground">{pack.size} figurinhas</div>
                    </div>
                    <div className="rounded-md border border-border bg-card p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-dim">Origem</div>
                        <div className="mt-2"><OriginBadge source={pack.source} label={sourceLabel(pack)} /></div>
                    </div>
                </div>

                {pack.activity_checkin_id ? (
                    <div className="rounded-md border border-border bg-muted p-3 text-sm text-foreground">
                        Check-in relacionado:{' '}
                        <Link className="underline" href={`/checkins/${pack.activity_checkin_id}`}>
                            #{pack.activity_checkin_id}
                        </Link>
                    </div>
                ) : null}

                {pack.status === 'pending' ? (
                    <section className="rounded-md border border-border bg-card p-4">
                        <p className="text-sm text-dim">Pacote fechado pronto para abertura.</p>
                        <div className="brand-hero mt-3 rounded-md border border-border p-4">
                            <div className={`mx-auto flex min-h-32 max-w-md items-center justify-center rounded-md border border-primary/25 bg-card/70 px-4 transition ${isOpening ? 'animate-pulse' : ''}`}>
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] uppercase tracking-wide text-primary">
                                        <Sparkles className="size-3" /> Reveal MAHA
                                    </div>
                                    <div className="mt-2 text-lg font-semibold text-foreground">{pack.size} figurinhas da temporada</div>
                                    <div className="mt-1 text-xs text-dim">{isOpening ? 'Abrindo pacote...' : 'Toque para revelar'}</div>
                                </div>
                            </div>
                        </div>
                        <button type="button" className="mt-3 rounded-sm border border-primary bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-60" onClick={openPack} disabled={isOpening}>
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
                    <section className="rounded-md border border-border bg-card p-4">
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
                                    const delay = reducedMotion ? '0ms' : `${index * 90}ms`;

                                    return (
                                        <div
                                            key={item.id}
                                            className="rounded-md border border-border bg-muted/60 p-3"
                                            style={{ animationDelay: delay }}
                                        >
                                            <div className="aspect-[3/4] overflow-hidden rounded-sm border border-border bg-muted">
                                                <img src={item.sticker.image_url} alt={item.sticker.title} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="mt-2 font-mono text-xs text-dim">{item.sticker.code}</div>
                                            <div className="mt-1 text-sm font-medium text-foreground">{item.sticker.title}</div>
                                            <div className="text-xs text-dim">{item.sticker.type} • {item.sticker.rarity}</div>
                                            <div className="mt-2 flex items-center justify-between gap-2">
                                                <Link className="text-xs underline" href={`/album/stickers/${item.sticker.id}`}>
                                                    Ver no álbum
                                                </Link>
                                                {revealedIds.includes(item.sticker.id) ? (
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
