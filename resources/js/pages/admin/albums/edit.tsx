import { Head } from '@inertiajs/react';
import AlbumForm from './form';

type Team = { id: number; name: string };

type Album = {
    id: number;
    team_id: number;
    team_ids: number[];
    name: string;
    slug: string;
    season: string | null;
    description: string | null;
    cover_image_path: string | null;
    starts_at: string | null;
    ends_at: string | null;
    status: string;
};

export default function AdminAlbumEdit({ album, teams }: { album: Album; teams: Team[] }) {
    return (
        <>
            <Head title={`Editar Álbum - ${album.name}`} />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Editar Álbum</h1>
                <p className="text-xs text-muted-foreground">Status atual: {album.status}. Nesta etapa, mudança de status ocorre apenas por publicar/arquivar.</p>
                <AlbumForm
                    teams={teams}
                    initialValues={{
                        team_ids: album.team_ids,
                        name: album.name,
                        slug: album.slug,
                        season: album.season ?? '',
                        description: album.description ?? '',
                        cover_image_path: album.cover_image_path ?? '',
                        starts_at: album.starts_at ?? '',
                        ends_at: album.ends_at ?? '',
                    }}
                    method="patch"
                    submitUrl={`/admin/albums/${album.id}`}
                    submitLabel="Salvar alterações"
                />
            </div>
        </>
    );
}
