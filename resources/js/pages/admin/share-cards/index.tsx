import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';

type RefItem = { id: number; name: string; email?: string };
type PaginationLink = { url: string | null; label: string; active: boolean };

type Row = {
    id: number;
    type: string;
    title: string;
    subtitle: string | null;
    created_at: string | null;
    user: RefItem;
    album: RefItem | null;
};

type Props = {
    cards: { data: Row[]; links: PaginationLink[] };
    filters: { user_id: number | null; album_id: number | null; type: string };
    types: string[];
    users: RefItem[];
    albums: RefItem[];
};

export default function AdminShareCardsIndex({ cards, filters, types, users, albums }: Props) {
    const [userId, setUserId] = useState(filters.user_id ? String(filters.user_id) : '');
    const [albumId, setAlbumId] = useState(filters.album_id ? String(filters.album_id) : '');
    const [type, setType] = useState(filters.type ?? '');

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get('/admin/share-cards', {
            user_id: userId,
            album_id: albumId,
            type,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Share Cards (Admin)" />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Share Cards</h1>

                <form onSubmit={submit} className="grid gap-3 rounded-sm border p-4 md:grid-cols-3">
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Usuário</label>
                        <select value={userId} onChange={(event) => setUserId(event.target.value)} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm">
                            <option value="">Todos</option>
                            {users.map((user) => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Álbum</label>
                        <select value={albumId} onChange={(event) => setAlbumId(event.target.value)} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm">
                            <option value="">Todos</option>
                            {albums.map((album) => <option key={album.id} value={album.id}>{album.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Tipo</label>
                        <select value={type} onChange={(event) => setType(event.target.value)} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm">
                            <option value="">Todos</option>
                            {types.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                        <button type="submit" className="cursor-pointer rounded-sm border bg-primary px-3 py-2 text-sm text-primary-foreground transition-all hover:brightness-110">Filtrar</button>
                    </div>
                </form>

                <div className="overflow-x-auto rounded-sm border">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Usuário</th>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Título</th>
                                <th className="px-4 py-2">Álbum</th>
                                <th className="px-4 py-2">Criado em</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cards.data.map((card) => (
                                <tr key={card.id} className="border-b">
                                    <td className="px-4 py-2 font-mono text-xs">#{card.id}</td>
                                    <td className="px-4 py-2">{card.user.email ?? card.user.name}</td>
                                    <td className="px-4 py-2">{card.type}</td>
                                    <td className="px-4 py-2">{card.title}</td>
                                    <td className="px-4 py-2">{card.album?.name ?? '-'}</td>
                                    <td className="px-4 py-2">{card.created_at ?? '-'}</td>
                                    <td className="px-4 py-2"><Link href={`/admin/share-cards/${card.id}`} className="text-xs underline">Ver</Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap gap-2">
                    {cards.links.map((link, index) => (
                        <button
                            key={`${link.label}-${index}`}
                            type="button"
                            onClick={() => link.url && router.visit(link.url)}
                            disabled={!link.url}
                            className={`rounded-sm border px-2 py-1 text-xs ${link.active ? 'bg-primary text-primary-foreground' : ''}`}
                        >
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
