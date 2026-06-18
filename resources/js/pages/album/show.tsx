import { Head, Link, usePage } from '@inertiajs/react';
import ShareExportPanel from '@/components/share-export-panel';
import { PageHeader } from '@/components/ui/page-header';

type Sticker = {
    id: number;
    code: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    type: string;
    rarity: string;
    image_url: string | null;
    is_unlocked: boolean;
    is_full_visible: boolean;
    album: { id: number; name: string; slug: string; teams: Array<{ id: number; name: string }> };
    player: { id: number; name: string; nickname: string | null; position: string | null; type: string } | null;
};

function DetailField({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0 rounded-md border border-border bg-card p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">{label}</div>
            <div className="mt-1 break-words text-sm text-foreground">{value}</div>
        </div>
    );
}

export default function AlbumStickerShow({ sticker, note }: { sticker: Sticker; note: string }) {
    const page = usePage<{ auth?: { user?: { name?: string } } }>();
    const userName = page.props.auth?.user?.name ?? 'Participante AAPH';
    const teams = sticker.album.teams.map((team) => team.name).join(', ') || '-';

    // Only collected stickers can be shared (you flaunt what you own).
    const sharePayload = {
        type: 'sticker_unlocked',
        title: sticker.title,
        subtitle: sticker.subtitle ?? `Figurinha ${sticker.code}`,
        album_name: sticker.album.name,
        user_name: userName,
        image_url: sticker.image_url ?? null,
        sticker_code: sticker.code,
    };
    const shareCopy = `Desbloqueei "${sticker.title}" no Álbum da Copa AAPH! #CopaAAPH`;

    return (
        <>
            <Head title={`Figurinha ${sticker.code}`} />
            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader
                    title={sticker.code}
                    subtitle={note}
                    actions={<Link href="/album" className="rounded-sm border border-border bg-card px-3 py-2 text-xs font-semibold">Voltar ao álbum</Link>}
                />

                <div className="grid items-start gap-4 md:grid-cols-[300px_minmax(0,1fr)]">
                    {/* Sticker card — full framed image, shown whole */}
                    <div className="album-paper p-3">
                        <div className="overflow-hidden rounded-md border border-[color:var(--sticker-frame)] bg-[color:var(--sticker-surface)]">
                            {sticker.image_url && sticker.is_full_visible ? (
                                <img src={sticker.image_url} alt={sticker.title} className="block w-full" />
                            ) : (
                                <div className="flex aspect-[3/4] items-center justify-center text-xs text-dim">
                                    {sticker.is_full_visible ? 'Sem imagem' : 'Conteúdo bloqueado'}
                                </div>
                            )}
                        </div>
                        <div className="mt-2 text-center text-xs font-semibold text-dim">
                            {sticker.is_unlocked ? 'Coletada' : 'Bloqueada'}
                        </div>
                    </div>

                    {/* Details — min-w-0 lets the column shrink and wrap instead of overflowing */}
                    <div className="min-w-0 space-y-3">
                        <div className="rounded-md border border-border bg-card p-4">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">Título</div>
                            <div className="mt-1 break-words text-lg font-semibold text-foreground">{sticker.title}</div>
                            {sticker.subtitle ? <div className="mt-1 break-words text-xs text-dim">{sticker.subtitle}</div> : null}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <DetailField label="Tipo" value={sticker.type} />
                            <DetailField label="Raridade" value={sticker.rarity} />
                            <DetailField label="Álbum" value={sticker.album.name} />
                            <DetailField label="Equipes" value={teams} />
                        </div>

                        <div className="min-w-0 rounded-md border border-border bg-card p-4">
                            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">Descrição</div>
                            <p className="break-words text-sm text-foreground">
                                {sticker.description ?? (sticker.is_full_visible ? 'Sem descrição cadastrada.' : 'Descrição indisponível para figurinha bloqueada.')}
                            </p>
                        </div>

                        {sticker.player ? (
                            <div className="min-w-0 rounded-md border border-border bg-card p-4">
                                <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">Vinculado a</div>
                                <div className="break-words text-sm text-foreground">{sticker.player.name}</div>
                                <div className="break-words text-xs text-dim">{sticker.player.position ?? '-'} | {sticker.player.type}</div>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Share — only for collected stickers */}
                {sticker.is_unlocked ? (
                    <section className="album-paper space-y-2 p-4">
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">Compartilhar figurinha</h2>
                            <p className="text-xs text-dim">Gere uma imagem pronta para postar nas suas redes.</p>
                        </div>
                        <ShareExportPanel payload={sharePayload} shareCopy={shareCopy} fileBase={`figurinha-${sticker.code}`} />
                    </section>
                ) : null}
            </div>
        </>
    );
}
