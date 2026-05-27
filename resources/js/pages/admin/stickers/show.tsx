import { Head, Link } from '@inertiajs/react';

type Sticker = {
    id: number;
    code: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    type: string;
    rarity: string;
    image_path: string | null;
    is_active: boolean;
    album: { id: number; name: string; slug: string };
    player: { id: number; name: string } | null;
};

export default function AdminStickerShow({ sticker }: { sticker: Sticker }) {
    return (
        <>
            <Head title={`Figurinha - ${sticker.code}`} />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-xl font-semibold tracking-tight">{sticker.code} - {sticker.title}</h1>
                    <Link href={`/admin/stickers/${sticker.id}/edit`} className="rounded-sm border px-3 py-2 text-xs">Editar</Link>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Álbum:</span> {sticker.album.name}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Jogador:</span> {sticker.player?.name ?? '-'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Tipo:</span> {sticker.type}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Raridade:</span> {sticker.rarity}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Ativa:</span> {sticker.is_active ? 'Sim' : 'Não'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Imagem path:</span> {sticker.image_path ?? '-'}</div>
                </div>

                <div className="rounded-sm border p-4 text-sm">
                    <div className="mb-1 text-xs uppercase text-muted-foreground">Descrição</div>
                    {sticker.description ?? 'Sem descrição'}
                </div>
            </div>
        </>
    );
}
