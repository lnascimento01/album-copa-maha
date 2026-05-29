import { Head } from '@inertiajs/react';
import StickerForm from './form';

type Album = { id: number; name: string; team_id: number };
type Player = { id: number; name: string; team_id: number };

type Sticker = {
    id: number;
    album_id: number;
    player_id: number | null;
    code: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    type: string;
    rarity: string;
    image_path: string | null;
    sort_order: number;
    is_active: boolean;
};

export default function AdminStickerEdit({ sticker, albums, players, types, rarities }: { sticker: Sticker; albums: Album[]; players: Player[]; types: string[]; rarities: string[] }) {
    return (
        <>
            <Head title={`Editar Figurinha - ${sticker.code}`} />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Editar Figurinha</h1>
                <p className="text-sm text-muted-foreground">Revise copy, código e raridade para manter consistência do catálogo realista.</p>
                <StickerForm
                    albums={albums}
                    players={players}
                    types={types}
                    rarities={rarities}
                    initialValues={{
                        album_id: sticker.album_id,
                        player_id: sticker.player_id ?? '',
                        code: sticker.code,
                        title: sticker.title,
                        subtitle: sticker.subtitle ?? '',
                        description: sticker.description ?? '',
                        type: sticker.type,
                        rarity: sticker.rarity,
                        image_path: sticker.image_path ?? '',
                        sort_order: sticker.sort_order,
                        is_active: sticker.is_active,
                    }}
                    method="patch"
                    submitUrl={`/admin/stickers/${sticker.id}`}
                    submitLabel="Salvar"
                />
            </div>
        </>
    );
}
