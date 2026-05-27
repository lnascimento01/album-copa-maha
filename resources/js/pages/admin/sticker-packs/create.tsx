import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type UserOption = { id: number; name: string; email: string };
type AlbumOption = { id: number; name: string };

type Props = {
    users: UserOption[];
    albums: AlbumOption[];
};

type StickerPackGrantForm = {
    user_id: number | '';
    album_id: number | '';
    quantity: number;
    size: number;
    note: string;
};

export default function AdminStickerPackCreate({ users, albums }: Props) {
    const form = useForm<StickerPackGrantForm>({
        user_id: '',
        album_id: '',
        quantity: 1,
        size: 3,
        note: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/admin/sticker-packs');
    };

    return (
        <>
            <Head title="Conceder Pacotes" />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Conceder Pacotes</h1>

                <form onSubmit={submit} className="grid gap-3 rounded-sm border p-4 md:grid-cols-2">
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Usuário aprovado</label>
                        <select className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.user_id} onChange={(event) => form.setData('user_id', Number(event.target.value) || '')}>
                            <option value="">Selecione</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>{user.email}</option>
                            ))}
                        </select>
                        {form.errors.user_id ? <p className="mt-1 text-xs text-red-600">{form.errors.user_id}</p> : null}
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Álbum ativo</label>
                        <select className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.album_id} onChange={(event) => form.setData('album_id', Number(event.target.value) || '')}>
                            <option value="">Selecione</option>
                            {albums.map((album) => (
                                <option key={album.id} value={album.id}>{album.name}</option>
                            ))}
                        </select>
                        {form.errors.album_id ? <p className="mt-1 text-xs text-red-600">{form.errors.album_id}</p> : null}
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Quantidade de pacotes</label>
                        <input type="number" min={1} max={20} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.quantity} onChange={(event) => form.setData('quantity', Number(event.target.value) || 1)} />
                        {form.errors.quantity ? <p className="mt-1 text-xs text-red-600">{form.errors.quantity}</p> : null}
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Tamanho de cada pacote</label>
                        <input type="number" min={1} max={10} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.size} onChange={(event) => form.setData('size', Number(event.target.value) || 3)} />
                        {form.errors.size ? <p className="mt-1 text-xs text-red-600">{form.errors.size}</p> : null}
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs uppercase text-muted-foreground">Observação</label>
                        <textarea className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" rows={4} value={form.data.note} onChange={(event) => form.setData('note', event.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" className="rounded-sm border bg-black px-3 py-2 text-sm text-white" disabled={form.processing}>
                            Conceder pacotes
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
