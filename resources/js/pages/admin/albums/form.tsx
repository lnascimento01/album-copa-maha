import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type Team = { id: number; name: string };

type AlbumFormValues = {
    team_ids: number[];
    name: string;
    slug: string;
    season: string;
    description: string;
    cover_image_path: string;
    starts_at: string;
    ends_at: string;
};

type AlbumFormProps = {
    teams: Team[];
    initialValues: AlbumFormValues;
    submitLabel: string;
    submitUrl: string;
    method: 'post' | 'patch';
};

export default function AlbumForm({ teams, initialValues, submitLabel, submitUrl, method }: AlbumFormProps) {
    const form = useForm<AlbumFormValues>(initialValues);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (method === 'post') {
            form.post(submitUrl);

            return;
        }

        form.patch(submitUrl);
    };

    return (
        <form onSubmit={submit} className="grid gap-3 rounded-sm border p-4 md:grid-cols-2">
            <div className="md:col-span-2">
                <label className="text-xs uppercase text-muted-foreground">Equipes do álbum</label>
                <div className="mt-1 grid gap-2 rounded-sm border border-zinc-300 bg-white p-3 sm:grid-cols-2 lg:grid-cols-3">
                    {teams.map((team) => {
                        const checked = form.data.team_ids.includes(team.id);

                        return (
                            <label key={team.id} className="flex items-center gap-2 text-sm text-zinc-800">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(event) => {
                                        if (event.target.checked) {
                                            form.setData('team_ids', [...form.data.team_ids, team.id]);
                                        } else {
                                            form.setData('team_ids', form.data.team_ids.filter((id) => id !== team.id));
                                        }
                                    }}
                                />
                                <span>{team.name}</span>
                            </label>
                        );
                    })}
                </div>
                {form.errors.team_ids ? <p className="mt-1 text-xs text-red-600">{form.errors.team_ids}</p> : null}
                {form.errors['team_ids.0'] ? <p className="mt-1 text-xs text-red-600">{form.errors['team_ids.0']}</p> : null}
            </div>
            <div>
                <label className="text-xs uppercase text-muted-foreground">Nome</label>
                <input className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
                {form.errors.name ? <p className="mt-1 text-xs text-red-600">{form.errors.name}</p> : null}
            </div>
            <div>
                <label className="text-xs uppercase text-muted-foreground">Slug</label>
                <input className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.slug} onChange={(event) => form.setData('slug', event.target.value)} />
                {form.errors.slug ? <p className="mt-1 text-xs text-red-600">{form.errors.slug}</p> : null}
            </div>
            <div>
                <label className="text-xs uppercase text-muted-foreground">Temporada</label>
                <input className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.season} onChange={(event) => form.setData('season', event.target.value)} />
            </div>
            <div>
                <label className="text-xs uppercase text-muted-foreground">Início</label>
                <input type="datetime-local" className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.starts_at} onChange={(event) => form.setData('starts_at', event.target.value)} />
            </div>
            <div>
                <label className="text-xs uppercase text-muted-foreground">Fim</label>
                <input type="datetime-local" className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.ends_at} onChange={(event) => form.setData('ends_at', event.target.value)} />
            </div>
            <div className="md:col-span-2">
                <label className="text-xs uppercase text-muted-foreground">Cover image path</label>
                <input className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.cover_image_path} onChange={(event) => form.setData('cover_image_path', event.target.value)} />
            </div>
            <div className="md:col-span-2">
                <label className="text-xs uppercase text-muted-foreground">Descrição</label>
                <textarea className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" rows={4} value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} />
            </div>
            <div className="md:col-span-2">
                <button type="submit" className="rounded-sm border bg-black px-3 py-2 text-sm text-white" disabled={form.processing}>{submitLabel}</button>
            </div>
        </form>
    );
}
