import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type TeamFormValues = {
    name: string;
    slug: string;
    short_name: string;
    description: string;
    logo_path: string;
    primary_color: string;
    secondary_color: string;
    is_active: boolean;
};

type TeamFormProps = {
    initialValues: TeamFormValues;
    submitLabel: string;
    submitUrl: string;
    method: 'post' | 'patch';
};

export default function TeamForm({ initialValues, submitLabel, submitUrl, method }: TeamFormProps) {
    const form = useForm<TeamFormValues>(initialValues);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (method === 'post') {
            form.post(submitUrl);

            return;
        }

        form.patch(submitUrl);
    };

    return (
        <form onSubmit={submit} className="album-paper grid gap-3 p-4 md:grid-cols-2">
            <div>
                <label className="admin-filter-label">Nome</label>
                <input className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
                {form.errors.name ? <p className="mt-1 text-xs text-red-600 dark:text-red-300">{form.errors.name}</p> : null}
            </div>
            <div>
                <label className="admin-filter-label">Slug</label>
                <input className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={form.data.slug} onChange={(event) => form.setData('slug', event.target.value)} />
                {form.errors.slug ? <p className="mt-1 text-xs text-red-600 dark:text-red-300">{form.errors.slug}</p> : null}
            </div>
            <div>
                <label className="admin-filter-label">Sigla</label>
                <input className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={form.data.short_name} onChange={(event) => form.setData('short_name', event.target.value)} placeholder="Ex.: AAPH" />
            </div>
            <div>
                <label className="admin-filter-label">Logo (URL/caminho)</label>
                <input className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={form.data.logo_path} onChange={(event) => form.setData('logo_path', event.target.value)} placeholder="/storage/... ou https://..." />
            </div>
            <div>
                <label className="admin-filter-label">Cor primária</label>
                <input className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={form.data.primary_color} onChange={(event) => form.setData('primary_color', event.target.value)} placeholder="#295D94" />
            </div>
            <div>
                <label className="admin-filter-label">Cor secundária</label>
                <input className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={form.data.secondary_color} onChange={(event) => form.setData('secondary_color', event.target.value)} placeholder="#8AA842" />
            </div>
            <div className="md:col-span-2">
                <label className="admin-filter-label">Descrição</label>
                <textarea className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" rows={4} value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground md:col-span-2">
                <input type="checkbox" checked={form.data.is_active} onChange={(event) => form.setData('is_active', event.target.checked)} />
                Time ativo na temporada
            </label>
            <div className="md:col-span-2 flex justify-end gap-2">
                <button type="submit" className="cursor-pointer rounded-sm border border-primary bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110" disabled={form.processing}>
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
