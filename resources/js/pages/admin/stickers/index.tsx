import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { PaginationLinks } from '@/components/ui/pagination-links';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { PageHeader } from '@/components/ui/page-header';
import { ResponsiveDataList } from '@/components/ui/responsive-data-list';
import { StatusBadge } from '@/components/ui/status-badge';

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
            <div className="brand-app-bg space-y-4 p-4">
                <PageHeader
                    title="Figurinhas"
                    subtitle="Gerencie código, tipo e raridade das figurinhas por álbum."
                    actions={<Link href="/admin/stickers/create" className="rounded-sm border border-primary bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Nova figurinha</Link>}
                />

                <form onSubmit={submit} className="album-paper grid gap-3 p-4 md:grid-cols-6">
                    <div className="md:col-span-2">
                        <label className="text-xs font-semibold tracking-[0.1em] text-dim uppercase">Busca</label>
                        <input className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Código ou título" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold tracking-[0.1em] text-dim uppercase">Álbum</label>
                        <select className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={albumId} onChange={(event) => setAlbumId(event.target.value)}>
                            <option value="">Todos</option>
                            {albums.map((album) => <option key={album.id} value={album.id}>{album.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold tracking-[0.1em] text-dim uppercase">Tipo</label>
                        <select className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={type} onChange={(event) => setType(event.target.value)}>
                            <option value="">Todos</option>
                            {types.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold tracking-[0.1em] text-dim uppercase">Raridade</label>
                        <select className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={rarity} onChange={(event) => setRarity(event.target.value)}>
                            <option value="">Todas</option>
                            {rarities.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold tracking-[0.1em] text-dim uppercase">Ativa</label>
                        <select className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={isActive} onChange={(event) => setIsActive(event.target.value)}>
                            <option value="">Todas</option>
                            <option value="1">Sim</option>
                            <option value="0">Não</option>
                        </select>
                    </div>
                    <div className="md:col-span-6 flex justify-end">
                        <button className="cursor-pointer rounded-sm border border-primary bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110" type="submit">Filtrar</button>
                    </div>
                </form>

                <DataTableShell title="Figurinhas cadastradas" subtitle="Visualização rápida de catálogo, vínculo e status operacional.">
                    <ResponsiveDataList
                        items={stickers.data}
                        getKey={(sticker) => sticker.id}
                        empty={<div className="rounded-md border border-dashed border-border bg-muted/60 p-6 text-center text-sm text-dim">Nenhuma figurinha encontrada.</div>}
                        renderItem={(sticker) => (
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-foreground">{sticker.title}</p>
                                        <p className="mt-1 font-mono text-xs text-dim">{sticker.code}</p>
                                    </div>
                                    <StatusBadge value={sticker.is_active ? 'active' : 'archived'} label={sticker.is_active ? 'Ativa' : 'Inativa'} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="responsive-data-key">Álbum</p>
                                        <p className="responsive-data-value">{sticker.album.name}</p>
                                    </div>
                                    <div>
                                        <p className="responsive-data-key">Jogador</p>
                                        <p className="responsive-data-value">{sticker.player?.name ?? '-'}</p>
                                    </div>
                                    <div>
                                        <p className="responsive-data-key">Tipo</p>
                                        <p className="responsive-data-value">{sticker.type}</p>
                                    </div>
                                    <div>
                                        <p className="responsive-data-key">Raridade</p>
                                        <p className="responsive-data-value">{sticker.rarity}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Link href={`/admin/stickers/${sticker.id}`} className="app-link-chip">Ver</Link>
                                    <Link href={`/admin/stickers/${sticker.id}/edit`} className="app-link-chip">Editar</Link>
                                </div>
                            </div>
                        )}
                    />
                    <table className="hidden min-w-full text-sm md:table">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="px-4 py-2">Código</th>
                                <th className="px-4 py-2">Título</th>
                                <th className="px-4 py-2">Álbum</th>
                                <th className="px-4 py-2">Jogador</th>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Raridade</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stickers.data.map((sticker) => (
                                <tr key={sticker.id} className="admin-table-row">
                                    <td className="px-4 py-2 font-mono text-xs text-dim">{sticker.code}</td>
                                    <td className="px-4 py-2 text-foreground">{sticker.title}</td>
                                    <td className="px-4 py-2 text-dim">{sticker.album.name}</td>
                                    <td className="px-4 py-2 text-dim">{sticker.player?.name ?? '-'}</td>
                                    <td className="px-4 py-2 text-dim">{sticker.type}</td>
                                    <td className="px-4 py-2 text-dim">{sticker.rarity}</td>
                                    <td className="px-4 py-2"><StatusBadge value={sticker.is_active ? 'active' : 'archived'} label={sticker.is_active ? 'Ativa' : 'Inativa'} /></td>
                                    <td className="space-x-2 px-4 py-2">
                                        <Link href={`/admin/stickers/${sticker.id}`} className="text-xs underline">Ver</Link>
                                        <Link href={`/admin/stickers/${sticker.id}/edit`} className="text-xs underline">Editar</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </DataTableShell>

                <PaginationLinks links={stickers.links} preserveState />
            </div>
        </>
    );
}
