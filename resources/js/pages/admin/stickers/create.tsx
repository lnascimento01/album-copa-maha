import { Head } from '@inertiajs/react';
import StickerForm from './form';

type Album = { id: number; name: string; team_id: number };
type Player = { id: number; name: string; team_id: number };

export default function AdminStickerCreate({ albums, players, types, rarities }: { albums: Album[]; players: Player[]; types: string[]; rarities: string[] }) {
    return (
        <>
            <Head title="Nova Figurinha" />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Nova Figurinha</h1>
                <p className="text-sm text-muted-foreground">Defina código, raridade e apresentação visual da figurinha para o álbum de temporada.</p>
                <StickerForm
                    albums={albums}
                    players={players}
                    types={types}
                    rarities={rarities}
                    initialValues={{
                        album_id: '',
                        player_id: '',
                        code: '',
                        title: '',
                        subtitle: '',
                        description: '',
                        type: types[0] ?? 'player',
                        rarity: rarities[0] ?? 'common',
                        image_path: '',
                        sort_order: 0,
                        is_active: true,
                    }}
                    method="post"
                    submitUrl="/admin/stickers"
                    submitLabel="Criar"
                />
            </div>
        </>
    );
}
