import { Head, Link } from '@inertiajs/react';

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

export default function AlbumStickerShow({ sticker, note }: { sticker: Sticker; note: string }) {
    return (
        <>
            <Head title={`Figurinha ${sticker.code}`} />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-xl font-semibold tracking-tight">{sticker.code}</h1>
                    <Link href="/album" className="rounded-sm border px-3 py-2 text-xs">Voltar ao álbum</Link>
                </div>
                <p className="text-xs text-muted-foreground">{note}</p>

                <div className="grid gap-4 md:grid-cols-[280px_1fr]">
                    <div className="rounded-sm border p-3">
                        <div className="aspect-[3/4] rounded-sm border bg-muted p-2">
                            {sticker.image_url && sticker.is_full_visible ? (
                                <img src={sticker.image_url} alt={sticker.title} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                                    {sticker.is_full_visible ? 'Sem imagem' : 'Conteúdo bloqueado'}
                                </div>
                            )}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">{sticker.is_unlocked ? 'Desbloqueada' : 'Bloqueada'}</div>
                    </div>

                    <div className="space-y-3">
                        <div className="rounded-sm border p-4">
                            <div className="text-xs uppercase text-muted-foreground">Título</div>
                            <div className="mt-1 text-lg font-medium">{sticker.title}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{sticker.subtitle ?? '-'}</div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Tipo:</span> {sticker.type}</div>
                            <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Raridade:</span> {sticker.rarity}</div>
                            <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Álbum:</span> {sticker.album.name}</div>
                            <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Equipes:</span> {sticker.album.teams.map((team) => team.name).join(', ') || '-'}</div>
                        </div>

                        <div className="rounded-sm border p-4 text-sm">
                            <div className="mb-1 text-xs uppercase text-muted-foreground">Descrição</div>
                            {sticker.description ?? 'Descrição indisponível para figurinha bloqueada.'}
                        </div>

                        {sticker.player ? (
                            <div className="rounded-sm border p-4 text-sm">
                                <div className="mb-1 text-xs uppercase text-muted-foreground">Vinculado a</div>
                                <div>{sticker.player.name}</div>
                                <div className="text-xs text-muted-foreground">{sticker.player.position ?? '-'} | {sticker.player.type}</div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    );
}
