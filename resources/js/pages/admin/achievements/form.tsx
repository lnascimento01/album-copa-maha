import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type RefItem = { id: number; name: string };

type FormValues = {
    team_id: number | '';
    album_id: number | '';
    name: string;
    slug: string;
    description: string;
    type: string;
    threshold: number | '';
    icon: string;
    color: string;
    is_active: boolean;
    sort_order: number;
};

type Props = {
    initialValues: FormValues;
    types: string[];
    teams: RefItem[];
    albums: RefItem[];
    method: 'post' | 'patch';
    submitUrl: string;
    submitLabel: string;
};

export default function AchievementForm({ initialValues, types, teams, albums, method, submitUrl, submitLabel }: Props) {
    const form = useForm({ ...initialValues });

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
                    <select className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.team_id} onChange={(event) => form.setData('team_id', event.target.value === '' ? '' : Number(event.target.value))}>
                        <option value="">Global</option>
                        {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                    </select>
                    {form.errors.team_id ? <div className="mt-1 text-xs text-red-700">{form.errors.team_id}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Álbum</label>
                    <select className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.album_id} onChange={(event) => form.setData('album_id', event.target.value === '' ? '' : Number(event.target.value))}>
                        <option value="">Global</option>
                        {albums.map((album) => <option key={album.id} value={album.id}>{album.name}</option>)}
                    </select>
                    {form.errors.album_id ? <div className="mt-1 text-xs text-red-700">{form.errors.album_id}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Nome</label>
                    <input className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
                    {form.errors.name ? <div className="mt-1 text-xs text-red-700">{form.errors.name}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Slug</label>
                    <input className="mt-1 w-full rounded-sm border px-2 py-2 text-sm font-mono" value={form.data.slug} onChange={(event) => form.setData('slug', event.target.value)} />
                    {form.errors.slug ? <div className="mt-1 text-xs text-red-700">{form.errors.slug}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Tipo</label>
                    <select className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.type} onChange={(event) => form.setData('type', event.target.value)}>
                        {types.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                    {form.errors.type ? <div className="mt-1 text-xs text-red-700">{form.errors.type}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Threshold</label>
                    <input
                        type="number"
                        min={1}
                        className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                        value={form.data.threshold}
                        onChange={(event) => form.setData('threshold', event.target.value === '' ? '' : Number(event.target.value))}
                    />
                    {form.errors.threshold ? <div className="mt-1 text-xs text-red-700">{form.errors.threshold}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Ícone</label>
                    <input className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.icon} onChange={(event) => form.setData('icon', event.target.value)} />
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Cor</label>
                    <input className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.color} onChange={(event) => form.setData('color', event.target.value)} />
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Ordem</label>
                    <input type="number" min={0} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.sort_order} onChange={(event) => form.setData('sort_order', Number(event.target.value))} />
                </div>

                <div className="flex items-center gap-2 pt-6 text-sm">
                    <input id="is_active" type="checkbox" checked={form.data.is_active} onChange={(event) => form.setData('is_active', event.target.checked)} />
                    <label htmlFor="is_active">Conquista ativa</label>
                </div>
            </div>

            <div>
                <label className="text-xs uppercase text-muted-foreground">Descrição</label>
                <textarea className="mt-1 min-h-24 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} />
            </div>

            <div className="flex justify-end">
                <button type="submit" disabled={form.processing} className="rounded-sm border bg-black px-3 py-2 text-sm text-white">{submitLabel}</button>
            </div>
        </form>
    );
}
