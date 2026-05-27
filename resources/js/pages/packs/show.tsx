import { Head, Link, router, usePage } from '@inertiajs/react';
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

    const openPack = () => {
        router.post(`/packs/${pack.id}/open`);
    };

    return (
        <>
            <Head title={`Pacote #${pack.id}`} />
            <div className="space-y-4 p-4 sm:p-5">
                <PageHeader
                    title={`Pacote #${pack.id}`}
                    subtitle="Detalhe do pacote recebido e histórico das figurinhas reveladas."
                    actions={<Link href="/packs" className="rounded-sm border border-zinc-300 px-3 py-2 text-xs">Voltar para pacotes</Link>}
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-md border border-zinc-200 bg-white p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Status</div>
                        <div className="mt-2"><StatusBadge value={pack.status} /></div>
                    </div>
                    <div className="rounded-md border border-zinc-200 bg-white p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Álbum</div>
                        <div className="mt-2 font-medium text-zinc-900">{pack.album.name}</div>
                    </div>
                    <div className="rounded-md border border-zinc-200 bg-white p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Tamanho</div>
                        <div className="mt-2 font-medium text-zinc-900">{pack.size} figurinhas</div>
                    </div>
                    <div className="rounded-md border border-zinc-200 bg-white p-4 text-sm">
                        <div className="text-xs uppercase tracking-wide text-zinc-500">Origem</div>
                        <div className="mt-2"><OriginBadge source={pack.source} label={sourceLabel(pack)} /></div>
                    </div>
                </div>

                {pack.activity_checkin_id ? (
                    <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
                        Check-in relacionado:{' '}
                        <Link className="underline" href={`/checkins/${pack.activity_checkin_id}`}>
                            #{pack.activity_checkin_id}
                        </Link>
                    </div>
                ) : null}

                {pack.status === 'pending' ? (
                    <section className="rounded-md border border-zinc-200 bg-white p-4">
                        <p className="text-sm text-zinc-700">Pacote fechado pronto para abertura.</p>
                        <button type="button" className="mt-3 rounded-sm border bg-zinc-950 px-3 py-2 text-sm text-white" onClick={openPack}>
                            Abrir pacote
                        </button>
                    </section>
                ) : null}

                {pack.status === 'cancelled' ? (
                    <section className="rounded-md border border-red-200 bg-red-50 p-4 text-sm">
                        <div className="font-medium text-red-900">Pacote cancelado</div>
                        <div className="text-red-800">Motivo: {pack.cancellation_reason ?? '-'}</div>
                    </section>
                ) : null}

                {pack.status === 'opened' ? (
                    <section className="rounded-md border border-zinc-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-sm font-semibold text-zinc-900">Figurinhas reveladas</h2>
                            <Link href="/album" className="text-xs underline">Ver no álbum</Link>
                        </div>
                        {pack.items.length === 0 ? (
                            <div className="mt-3">
                                <EmptyState title="Nenhuma figurinha registrada neste pacote." />
                            </div>
                        ) : (
                            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {pack.items.map((item) => (
                                    <div key={item.id} className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                                        <div className="font-mono text-xs text-zinc-700">{item.sticker.code}</div>
                                        <div className="mt-1 text-sm font-medium text-zinc-900">{item.sticker.title}</div>
                                        <div className="text-xs text-zinc-600">{item.sticker.type} • {item.sticker.rarity}</div>
                                        <div className="mt-2 flex items-center justify-between gap-2">
                                            <Link className="text-xs underline" href={`/album/stickers/${item.sticker.id}`}>
                                                Ver no álbum
                                            </Link>
                                            {revealedIds.includes(item.sticker.id) ? (
                                                <StatusBadge value="opened" label="Revelada agora" />
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                ) : null}
            </div>
        </>
    );
}
