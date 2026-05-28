import { useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import type { FormEvent } from 'react';

type Album = { id: number; name: string; team_id: number | null; team_ids?: number[] };
type Player = { id: number; name: string; team_id: number };

type StickerFormValues = {
    album_id: number | '';
    player_id: number | '';
    code: string;
    title: string;
    subtitle: string;
    description: string;
    type: string;
    rarity: string;
    image_path: string;
    sort_order: number;
    is_active: boolean;
};

type StickerFormProps = {
    albums: Album[];
    players: Player[];
    types: string[];
    rarities: string[];
    initialValues: StickerFormValues;
    submitLabel: string;
    submitUrl: string;
    method: 'post' | 'patch';
};

const codePrefixByType: Record<string, string> = {
    player: 'MAHA',
    goalkeeper: 'GK',
    staff: 'STF',
    coach: 'COA',
    moment: 'MOM',
    special: 'SPC',
    legend: 'LEG',
    team: 'TEAM',
};

function padCodeNumber(value: number): string {
    return String(value).padStart(3, '0');
}

export default function StickerForm({ albums, players, types, rarities, initialValues, submitLabel, submitUrl, method }: StickerFormProps) {
    const form = useForm<StickerFormValues>(initialValues);

    const playerOptions = useMemo(() => {
        const selectedAlbum = albums.find((album) => album.id === Number(form.data.album_id));

        if (!selectedAlbum) {
            return players;
        }

        const teamIds = selectedAlbum.team_ids ?? (selectedAlbum.team_id ? [selectedAlbum.team_id] : []);

        if (teamIds.length === 0) {
            return players;
        }

        return players.filter((player) => teamIds.includes(player.team_id));
    }, [albums, players, form.data.album_id]);

    const selectedPlayer = useMemo(() => {
        return players.find((player) => player.id === Number(form.data.player_id)) ?? null;
    }, [players, form.data.player_id]);

    const hasImagePreview = useMemo(() => {
        const value = form.data.image_path.trim();

        return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/');
    }, [form.data.image_path]);

    const suggestCode = () => {
        const prefix = codePrefixByType[form.data.type] ?? 'MAHA';
        const baseNumber = form.data.sort_order > 0 ? form.data.sort_order : 1;

        form.setData('code', `${prefix}-${padCodeNumber(baseNumber)}`);
    };

    const syncTitleFromPlayer = () => {
        if (!selectedPlayer) {
            return;
        }

        form.setData('title', selectedPlayer.name);

        if (form.data.subtitle.trim() === '') {
            form.setData('subtitle', 'Temporada 2026');
        }
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (method === 'post') {
            form.post(submitUrl);

            return;
        }

        form.patch(submitUrl);
    };

    return (
        <form onSubmit={submit} className="space-y-4 rounded-md border border-zinc-200 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-2">
                <div>
                    <label className="text-xs uppercase tracking-wide text-zinc-500">Álbum</label>
                    <select className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm" value={form.data.album_id} onChange={(event) => form.setData('album_id', Number(event.target.value) || '')}>
                        <option value="">Selecione</option>
                        {albums.map((album) => <option key={album.id} value={album.id}>{album.name}</option>)}
                    </select>
                    {form.errors.album_id ? <p className="mt-1 text-xs text-red-600">{form.errors.album_id}</p> : null}
                </div>
                <div>
                    <label className="text-xs uppercase tracking-wide text-zinc-500">Jogador vinculado (opcional)</label>
                    <div className="flex gap-2">
                        <select className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm" value={form.data.player_id} onChange={(event) => form.setData('player_id', Number(event.target.value) || '')}>
                            <option value="">Sem vínculo</option>
                            {playerOptions.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}
                        </select>
                        <button type="button" onClick={syncTitleFromPlayer} className="mt-1 rounded-sm border border-zinc-300 px-2 text-xs text-zinc-700">
                            Usar nome
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-xs uppercase tracking-wide text-zinc-500">Código</label>
                    <div className="flex gap-2">
                        <input className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm font-mono" value={form.data.code} onChange={(event) => form.setData('code', event.target.value)} placeholder="MAHA-001" />
                        <button type="button" onClick={suggestCode} className="mt-1 rounded-sm border border-zinc-300 px-2 text-xs text-zinc-700">
                            Sugerir
                        </button>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-500">Exemplos: MAHA-001, GK-001, MOM-001.</p>
                    {form.errors.code ? <p className="mt-1 text-xs text-red-600">{form.errors.code}</p> : null}
                </div>
                <div>
                    <label className="text-xs uppercase tracking-wide text-zinc-500">Título</label>
                    <input className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm" value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} placeholder="Ex.: Atleta MAHA 01" />
                    {form.errors.title ? <p className="mt-1 text-xs text-red-600">{form.errors.title}</p> : null}
                </div>

                <div>
                    <label className="text-xs uppercase tracking-wide text-zinc-500">Subtítulo</label>
                    <input className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm" value={form.data.subtitle} onChange={(event) => form.setData('subtitle', event.target.value)} placeholder="Ex.: Ponta MAHA" />
                </div>
                <div>
                    <label className="text-xs uppercase tracking-wide text-zinc-500">Imagem (URL/caminho)</label>
                    <input className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm" value={form.data.image_path} onChange={(event) => form.setData('image_path', event.target.value)} placeholder="https://... ou /storage/..." />
                    <p className="mt-1 text-[11px] text-zinc-500">Nesta etapa o campo é textual com preview simples.</p>
                </div>

                <div>
                    <label className="text-xs uppercase tracking-wide text-zinc-500">Tipo</label>
                    <select className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm" value={form.data.type} onChange={(event) => form.setData('type', event.target.value)}>
                        {types.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs uppercase tracking-wide text-zinc-500">Raridade</label>
                    <select className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm" value={form.data.rarity} onChange={(event) => form.setData('rarity', event.target.value)}>
                        {rarities.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                </div>

                <div>
                    <label className="text-xs uppercase tracking-wide text-zinc-500">Ordem no álbum</label>
                    <input type="number" min={0} className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm" value={form.data.sort_order} onChange={(event) => form.setData('sort_order', Number(event.target.value) || 0)} />
                </div>
                <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm text-zinc-800">
                        <input type="checkbox" checked={form.data.is_active} onChange={(event) => form.setData('is_active', event.target.checked)} />
                        Figurinha ativa
                    </label>
                </div>
            </div>

            {hasImagePreview ? (
                <div className="rounded-sm border border-zinc-200 bg-zinc-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-zinc-500">Preview da figurinha</div>
                    <div className="mt-2 flex items-start gap-3">
                        <img src={form.data.image_path} alt="Preview da figurinha" className="h-40 w-28 rounded-sm border border-zinc-300 object-cover" />
                        <div className="rounded-sm border border-zinc-300 bg-white p-2 text-xs text-zinc-700">
                            <div className="font-mono">{form.data.code || 'CODE-000'}</div>
                            <div className="mt-1 font-semibold">{form.data.title || 'Título da figurinha'}</div>
                            <div className="text-zinc-500">{form.data.subtitle || 'Subtítulo'}</div>
                        </div>
                    </div>
                </div>
            ) : null}

            <div>
                <label className="text-xs uppercase tracking-wide text-zinc-500">Descrição</label>
                <textarea className="mt-1 w-full rounded-sm border border-zinc-300 px-2 py-2 text-sm" rows={4} value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} placeholder="Texto de apoio para contexto da figurinha." />
            </div>

            <div>
                <button type="submit" className="rounded-sm border bg-primary px-3 py-2 text-sm text-primary-foreground" disabled={form.processing}>{submitLabel}</button>
            </div>
        </form>
    );
}
