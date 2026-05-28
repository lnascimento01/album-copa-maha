import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type TeamOption = { id: number; name: string };
type AlbumOption = { id: number; name: string; team_id?: number };

type FormValues = {
    team_id: number | '';
    album_id: number | '';
    title: string;
    slug: string;
    type: string;
    description: string;
    starts_at: string;
    ends_at: string;
    reward_pack_quantity: number;
    reward_pack_size: number;
};

type Props = {
    initialValues: FormValues;
    teams: TeamOption[];
    albums: AlbumOption[];
    types: string[];
    method: 'post' | 'patch';
    submitUrl: string;
    submitLabel: string;
};

export default function ActivityForm({
    initialValues,
    teams,
    albums,
    types,
    method,
    submitUrl,
    submitLabel,
}: Props) {
    const form = useForm({
        team_id: initialValues.team_id,
        album_id: initialValues.album_id,
        title: initialValues.title,
        slug: initialValues.slug,
        type: initialValues.type,
        description: initialValues.description,
        starts_at: initialValues.starts_at,
        ends_at: initialValues.ends_at,
        reward_pack_quantity: initialValues.reward_pack_quantity,
        reward_pack_size: initialValues.reward_pack_size,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (method === 'post') {
            form.post(submitUrl);

            return;
        }

        form.patch(submitUrl);
    };

    return (
        <form onSubmit={submit} className="space-y-4 rounded-sm border p-4">
            <div className="grid gap-3 md:grid-cols-2">
                <div>
                    <label className="text-xs uppercase text-muted-foreground">Time</label>
                    <select
                        value={form.data.team_id}
                        onChange={(event) => form.setData('team_id', Number(event.target.value))}
                        className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                    >
                        <option value="">Selecione</option>
                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                    </select>
                    {form.errors.team_id ? <div className="mt-1 text-xs text-red-700">{form.errors.team_id}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Álbum</label>
                    <select
                        value={form.data.album_id}
                        onChange={(event) => form.setData('album_id', Number(event.target.value))}
                        className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                    >
                        <option value="">Selecione</option>
                        {albums.map((album) => (
                            <option key={album.id} value={album.id}>{album.name}</option>
                        ))}
                    </select>
                    {form.errors.album_id ? <div className="mt-1 text-xs text-red-700">{form.errors.album_id}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Título</label>
                    <input
                        value={form.data.title}
                        onChange={(event) => form.setData('title', event.target.value)}
                        className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                    />
                    {form.errors.title ? <div className="mt-1 text-xs text-red-700">{form.errors.title}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Slug</label>
                    <input
                        value={form.data.slug}
                        onChange={(event) => form.setData('slug', event.target.value)}
                        className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                    />
                    {form.errors.slug ? <div className="mt-1 text-xs text-red-700">{form.errors.slug}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Tipo</label>
                    <select
                        value={form.data.type}
                        onChange={(event) => form.setData('type', event.target.value)}
                        className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                    >
                        {types.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    {form.errors.type ? <div className="mt-1 text-xs text-red-700">{form.errors.type}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Início</label>
                    <input
                        type="datetime-local"
                        value={form.data.starts_at}
                        onChange={(event) => form.setData('starts_at', event.target.value)}
                        className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Fim</label>
                    <input
                        type="datetime-local"
                        value={form.data.ends_at}
                        onChange={(event) => form.setData('ends_at', event.target.value)}
                        className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Pacotes por presença</label>
                    <input
                        type="number"
                        min={0}
                        max={10}
                        value={form.data.reward_pack_quantity}
                        onChange={(event) => form.setData('reward_pack_quantity', Number(event.target.value))}
                        className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                    />
                    {form.errors.reward_pack_quantity ? <div className="mt-1 text-xs text-red-700">{form.errors.reward_pack_quantity}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Tamanho do pacote</label>
                    <input
                        type="number"
                        min={1}
                        max={10}
                        value={form.data.reward_pack_size}
                        onChange={(event) => form.setData('reward_pack_size', Number(event.target.value))}
                        className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                    />
                    {form.errors.reward_pack_size ? <div className="mt-1 text-xs text-red-700">{form.errors.reward_pack_size}</div> : null}
                </div>
            </div>

            <div>
                <label className="text-xs uppercase text-muted-foreground">Descrição</label>
                <textarea
                    value={form.data.description}
                    onChange={(event) => form.setData('description', event.target.value)}
                    className="mt-1 min-h-24 w-full rounded-sm border px-2 py-2 text-sm"
                />
                {form.errors.description ? <div className="mt-1 text-xs text-red-700">{form.errors.description}</div> : null}
            </div>

            <div className="rounded-sm border bg-zinc-50 p-3 text-xs text-muted-foreground">
                Cada check-in confirmado nesta atividade gera {form.data.reward_pack_quantity} pacote(s) com {form.data.reward_pack_size} figurinha(s).
            </div>

            <div className="flex justify-end">
                <button disabled={form.processing} className="rounded-sm border bg-primary px-3 py-2 text-sm text-primary-foreground" type="submit">
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
