import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';

type Album = { id: number; name: string };

type StickerRow = {
    id: number;
    code: string;
    title: string;
    type: string;
    rarity: string;
    is_active: boolean;
    album: Album;
    player: { id: number; name: string } | null;
};

type LinkItem = { url: string | null; label: string; active: boolean };

type Props = {
    stickers: { data: StickerRow[]; links: LinkItem[] };
    filters: { search: string; album_id: number | null; type: string; rarity: string; is_active: string };
    albums: Album[];
    types: string[];
    rarities: string[];
};

export default function StickersIndex({ stickers, filters, albums, types, rarities }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [albumId, setAlbumId] = useState<string>(filters.album_id ? String(filters.album_id) : '');
    const [type, setType] = useState(filters.type ?? '');
    const [rarity, setRarity] = useState(filters.rarity ?? '');
    const [isActive, setIsActive] = useState(filters.is_active ?? '');

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get('/admin/stickers', {
            search,
            album_id: albumId,
            type,
            rarity,
            is_active: isActive,
        }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Figurinhas" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-xl font-semibold tracking-tight">Figurinhas</h1>
                    <Link href="/admin/stickers/create" className="rounded-sm border bg-primary px-3 py-2 text-xs text-primary-foreground">Nova</Link>
                </div>

                <form onSubmit={submit} className="grid gap-3 rounded-sm border p-4 md:grid-cols-6">
                    <div className="md:col-span-2">
                        <label className="text-xs uppercase text-muted-foreground">Busca</label>
                        <input className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Código ou título" />
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Álbum</label>
                        <select className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={albumId} onChange={(event) => setAlbumId(event.target.value)}>
                            <option value="">Todos</option>
                            {albums.map((album) => <option key={album.id} value={album.id}>{album.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Tipo</label>
                        <select className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={type} onChange={(event) => setType(event.target.value)}>
                            <option value="">Todos</option>
                            {types.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Raridade</label>
                        <select className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={rarity} onChange={(event) => setRarity(event.target.value)}>
                            <option value="">Todas</option>
                            {rarities.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Ativa</label>
                        <select className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={isActive} onChange={(event) => setIsActive(event.target.value)}>
                            <option value="">Todas</option>
                            <option value="1">Sim</option>
                            <option value="0">Não</option>
                        </select>
                    </div>
                    <div className="md:col-span-6 flex justify-end">
                        <button className="rounded-sm border bg-primary px-3 py-2 text-sm text-primary-foreground" type="submit">Filtrar</button>
                    </div>
                </form>

                <div className="overflow-x-auto rounded-sm border">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="px-4 py-2">Código</th>
                                <th className="px-4 py-2">Título</th>
                                <th className="px-4 py-2">Álbum</th>
                                <th className="px-4 py-2">Jogador</th>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Raridade</th>
                                <th className="px-4 py-2">Ativa</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stickers.data.map((sticker) => (
                                <tr key={sticker.id} className="border-b">
                                    <td className="px-4 py-2 font-mono text-xs">{sticker.code}</td>
                                    <td className="px-4 py-2">{sticker.title}</td>
                                    <td className="px-4 py-2">{sticker.album.name}</td>
                                    <td className="px-4 py-2">{sticker.player?.name ?? '-'}</td>
                                    <td className="px-4 py-2">{sticker.type}</td>
                                    <td className="px-4 py-2">{sticker.rarity}</td>
                                    <td className="px-4 py-2">{sticker.is_active ? 'Sim' : 'Não'}</td>
                                    <td className="space-x-2 px-4 py-2">
                                        <Link href={`/admin/stickers/${sticker.id}`} className="text-xs underline">Ver</Link>
                                        <Link href={`/admin/stickers/${sticker.id}/edit`} className="text-xs underline">Editar</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap gap-2">
                    {stickers.links.map((link, index) => (
                        <button key={`${link.label}-${index}`} type="button" onClick={() => link.url && router.visit(link.url)} disabled={!link.url} className={`rounded-sm border px-2 py-1 text-xs ${link.active ? 'bg-primary text-primary-foreground' : ''}`}>
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
