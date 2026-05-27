import { Head } from '@inertiajs/react';
import AlbumForm from './form';

type Team = { id: number; name: string };

export default function AdminAlbumCreate({ teams }: { teams: Team[] }) {
    return (
        <>
            <Head title="Novo Álbum" />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Novo Álbum</h1>
                <AlbumForm
                    teams={teams}
                    initialValues={{
                        team_id: '',
                        name: '',
                        slug: '',
                        season: '',
                        description: '',
                        cover_image_path: '',
                        starts_at: '',
                        ends_at: '',
                    }}
                    method="post"
                    submitUrl="/admin/albums"
                    submitLabel="Criar álbum"
                />
            </div>
        </>
    );
}
