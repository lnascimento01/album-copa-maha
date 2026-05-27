import { useForm } from '@inertiajs/react';
import { useMemo } from 'react';
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

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (method === 'post') {
            form.post(submitUrl);

            return;
        }

        form.patch(submitUrl);
    };

    const hasPhotoPreview = useMemo(() => {
        const value = form.data.photo_path.trim();

        return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/');
    }, [form.data.photo_path]);

    return (
        <form onSubmit={submit} className="space-y-4 rounded-md border border-zinc-200 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-2">
                <div>
                    <label className="text-xs uppercase tracking-wide text-zinc-500">Time</label>
                    <select className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm" value={form.data.team_id} onChange={(event) => form.setData('team_id', Number(event.target.value) || '')}>
                        <option value="">Selecione</option>
                        {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                    </select>
                    {form.errors.team_id ? <p className="mt-1 text-xs text-red-600">{form.errors.team_id}</p> : null}
                </div>
                <div>
                    <label className="text-xs uppercase tracking-wide text-zinc-500">Tipo</label>
                    <select className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm" value={form.data.type} onChange={(event) => form.setData('type', event.target.value)}>
                        {types.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs uppercase tracking-wide text-zinc-500">Nome completo</label>
                    <input className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} placeholder="Ex.: Atleta MAHA 01" />
                    {form.errors.name ? <p className="mt-1 text-xs text-red-600">{form.errors.name}</p> : null}
                </div>
                <div>
                    <label className="text-xs uppercase tracking-wide text-zinc-500">Apelido (opcional)</label>
                    <input className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm" value={form.data.nickname} onChange={(event) => form.setData('nickname', event.target.value)} placeholder="Ex.: Central MAHA" />
                </div>
                <div>
                    <label className="text-xs uppercase tracking-wide text-zinc-500">Número da camisa</label>
                    <input className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm" value={form.data.shirt_number} onChange={(event) => form.setData('shirt_number', event.target.value)} placeholder="Ex.: 10" />
                    <p className="mt-1 text-[11px] text-zinc-500">Use somente o número oficial exibido no card.</p>
                </div>
                <div>
                    <label className="text-xs uppercase tracking-wide text-zinc-500">Posição</label>
                    <input className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm" value={form.data.position} onChange={(event) => form.setData('position', event.target.value)} placeholder="Ex.: Ponta" />
                    <div className="mt-1 flex flex-wrap gap-1">
                        {['Ponta', 'Central', 'Pivô', 'Armador', 'Goleiro', 'Comissão'].map((position) => (
                            <button
                                key={position}
                                type="button"
                                onClick={() => form.setData('position', position)}
                                className="rounded-sm border border-zinc-300 px-2 py-0.5 text-[11px] text-zinc-700"
                            >
                                {position}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-xs uppercase tracking-wide text-zinc-500">Ordem no catálogo</label>
                    <input type="number" min={0} className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm" value={form.data.sort_order} onChange={(event) => form.setData('sort_order', Number(event.target.value) || 0)} />
                </div>
                <div>
                    <label className="text-xs uppercase tracking-wide text-zinc-500">Foto (URL/caminho)</label>
                    <input className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm" value={form.data.photo_path} onChange={(event) => form.setData('photo_path', event.target.value)} placeholder="https://... ou /storage/..." />
                    <p className="mt-1 text-[11px] text-zinc-500">Nesta etapa o campo é textual. Upload real pode ser evoluído depois.</p>
                </div>
            </div>

            {hasPhotoPreview ? (
                <div className="rounded-sm border border-zinc-200 bg-zinc-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-zinc-500">Preview de foto</div>
                    <img src={form.data.photo_path} alt="Preview de atleta" className="mt-2 h-36 w-28 rounded-sm border border-zinc-300 object-cover" />
                </div>
            ) : null}

            <div>
                <label className="text-xs uppercase tracking-wide text-zinc-500">Bio / texto da figurinha</label>
                <textarea className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm" rows={4} value={form.data.bio} onChange={(event) => form.setData('bio', event.target.value)} placeholder="Resumo curto para descrição do card." />
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-800">
                <input type="checkbox" checked={form.data.is_active} onChange={(event) => form.setData('is_active', event.target.checked)} />
                Registro ativo para catálogo da temporada
            </label>

            <div>
                <button type="submit" className="rounded-sm border bg-zinc-950 px-3 py-2 text-sm text-white" disabled={form.processing}>{submitLabel}</button>
            </div>
        </form>
    );
}
