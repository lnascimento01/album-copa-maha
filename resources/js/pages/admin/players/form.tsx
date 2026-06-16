import { useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

type Team = { id: number; name: string };

type PlayerFormValues = {
    team_id: number | '';
    name: string;
    nickname: string;
    shirt_number: string;
    position: string;
    type: string;
    bio: string;
    photo_path: string;
    photo_upload: File | null;
    sort_order: number;
    is_active: boolean;
};

type PlayerFormProps = {
    teams: Team[];
    types: string[];
    initialValues: PlayerFormValues;
    submitLabel: string;
    submitUrl: string;
    method: 'post' | 'patch';
};

export default function PlayerForm({ teams, types, initialValues, submitLabel, submitUrl, method }: PlayerFormProps) {
    const form = useForm<PlayerFormValues>(initialValues);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!form.data.photo_upload) {
            setFilePreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(form.data.photo_upload);
        setFilePreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [form.data.photo_upload]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (method === 'post') {
            form.post(submitUrl);

            return;
        }

        form.patch(submitUrl);
    };

    const previewSrc = useMemo(() => {
        if (filePreviewUrl) return filePreviewUrl;
        const value = form.data.photo_path.trim();
        if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) return value;
        return null;
    }, [filePreviewUrl, form.data.photo_path]);

    return (
        <form onSubmit={submit} className="album-paper space-y-4 p-4">
            <div className="grid gap-3 md:grid-cols-2">
                <div>
                    <label className="admin-filter-label">Time</label>
                    <select className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={form.data.team_id} onChange={(event) => form.setData('team_id', Number(event.target.value) || '')}>
                        <option value="">Selecione</option>
                        {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                    </select>
                    {form.errors.team_id ? <p className="mt-1 text-xs text-red-600 dark:text-red-300">{form.errors.team_id}</p> : null}
                </div>
                <div>
                    <label className="admin-filter-label">Tipo</label>
                    <select className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={form.data.type} onChange={(event) => form.setData('type', event.target.value)}>
                        {types.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                </div>
                <div>
                    <label className="admin-filter-label">Nome completo</label>
                    <input className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} placeholder="Ex.: Atleta AAPH 01" />
                    {form.errors.name ? <p className="mt-1 text-xs text-red-600 dark:text-red-300">{form.errors.name}</p> : null}
                </div>
                <div>
                    <label className="admin-filter-label">Apelido</label>
                    <input className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={form.data.nickname} onChange={(event) => form.setData('nickname', event.target.value)} placeholder="Ex.: Central AAPH" />
                </div>
                <div>
                    <label className="admin-filter-label">Número da camisa</label>
                    <input className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={form.data.shirt_number} onChange={(event) => form.setData('shirt_number', event.target.value)} placeholder="Ex.: 10" />
                    <p className="mt-1 text-[11px] text-dim">Use o número oficial exibido no card da temporada.</p>
                </div>
                <div>
                    <label className="admin-filter-label">Posição</label>
                    <input className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={form.data.position} onChange={(event) => form.setData('position', event.target.value)} placeholder="Ex.: Ponta" />
                    <div className="mt-1 flex flex-wrap gap-1">
                        {['Ponta', 'Central', 'Pivô', 'Armador', 'Goleiro', 'Comissão'].map((position) => (
                            <button
                                key={position}
                                type="button"
                                onClick={() => form.setData('position', position)}
                                className="app-link-chip !px-2 !py-0.5 !text-[10px]"
                            >
                                {position}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="admin-filter-label">Ordem no catálogo</label>
                    <input type="number" min={0} className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={form.data.sort_order} onChange={(event) => form.setData('sort_order', Number(event.target.value) || 0)} />
                </div>
                <div className="md:col-span-2">
                    <label className="admin-filter-label">Foto — upload de arquivo</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm file:mr-2 file:cursor-pointer file:rounded-sm file:border-0 file:bg-primary file:px-2 file:py-1 file:text-xs file:font-semibold file:text-primary-foreground"
                        onChange={(e) => form.setData('photo_upload', e.target.files?.[0] ?? null)}
                    />
                    {form.errors.photo_upload ? <p className="mt-1 text-xs text-red-600 dark:text-red-300">{form.errors.photo_upload}</p> : null}
                    <p className="mt-1 text-[11px] text-dim">Ou informe uma URL abaixo para manter a foto atual.</p>
                </div>
                <div className="md:col-span-2">
                    <label className="admin-filter-label">Foto (URL/caminho)</label>
                    <input className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" value={form.data.photo_path} onChange={(event) => form.setData('photo_path', event.target.value)} placeholder="https://... ou /storage/..." />
                </div>
            </div>

            {previewSrc ? (
                <div className="rounded-sm border border-border bg-muted/70 p-3">
                    <div className="admin-filter-label">Preview de foto</div>
                    <img src={previewSrc} alt="Preview de atleta" className="mt-2 h-36 w-28 rounded-sm border border-border object-cover" />
                </div>
            ) : null}

            <div>
                <label className="admin-filter-label">Bio / texto da figurinha</label>
                <textarea className="mt-1 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm" rows={4} value={form.data.bio} onChange={(event) => form.setData('bio', event.target.value)} placeholder="Resumo curto para descrição do card." />
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={form.data.is_active} onChange={(event) => form.setData('is_active', event.target.checked)} />
                Registro ativo para catálogo da temporada
            </label>

            <div className="flex justify-end">
                <button type="submit" className="rounded-sm border border-primary bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground" disabled={form.processing}>{submitLabel}</button>
            </div>
        </form>
    );
}
