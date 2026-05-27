import { Head, Link, router } from '@inertiajs/react';

type Album = {
    id: number;
    name: string;
    slug: string;
    season: string | null;
    description: string | null;
    cover_image_path: string | null;
    status: string;
    published_at: string | null;
    stickers_count: number;
    team: { id: number; name: string; slug: string };
};

export default function AdminAlbumShow({ album }: { album: Album }) {
    return (
        <>
            <Head title={`Álbum - ${album.name}`} />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-xl font-semibold tracking-tight">{album.name}</h1>
                    <div className="flex gap-2">
                        <Link href={`/admin/albums/${album.id}/edit`} className="rounded-sm border px-3 py-2 text-xs">Editar</Link>
                        <button type="button" className="rounded-sm border px-3 py-2 text-xs" onClick={() => router.patch(`/admin/albums/${album.id}/publish`)}>Publicar</button>
                        <button type="button" className="rounded-sm border px-3 py-2 text-xs" onClick={() => router.patch(`/admin/albums/${album.id}/archive`)}>Arquivar</button>
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Time:</span> {album.team.name}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Status:</span> {album.status}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Slug:</span> {album.slug}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Temporada:</span> {album.season ?? '-'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Publicado em:</span> {album.published_at ?? '-'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Figurinhas:</span> {album.stickers_count}</div>
                </div>

                <div className="rounded-sm border p-4 text-sm">
                    <div className="mb-1 text-xs uppercase text-muted-foreground">Descrição</div>
                    {album.description ?? 'Sem descrição'}
                </div>
            </div>
        </>
    );
}
