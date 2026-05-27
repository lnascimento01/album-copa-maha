import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type Team = { id: number; name: string };
type Album = { id: number; name: string; team_id?: number };

type FormValues = {
    team_id: number | '';
    album_id: number | '';
    code: string;
    title: string;
    description: string;
    status: string;
    source_channel: string;
    reward_pack_quantity: number;
    reward_pack_size: number;
    starts_at: string;
    expires_at: string;
    max_total_redemptions: number | '';
    max_redemptions_per_user: number;
};

type Props = {
    initialValues: FormValues;
    teams: Team[];
    albums: Album[];
    statuses: string[];
    channels: string[];
    method: 'post' | 'patch';
    submitUrl: string;
    submitLabel: string;
};

export default function RewardCodeForm({
    initialValues,
    teams,
    albums,
    statuses,
    channels,
    method,
    submitUrl,
    submitLabel,
}: Props) {
    const form = useForm({
        ...initialValues,
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
                    <select className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.team_id} onChange={(event) => form.setData('team_id', Number(event.target.value))}>
                        <option value="">Selecione</option>
                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                    </select>
                    {form.errors.team_id ? <div className="mt-1 text-xs text-red-700">{form.errors.team_id}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Álbum</label>
                    <select className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.album_id} onChange={(event) => form.setData('album_id', Number(event.target.value))}>
                        <option value="">Selecione</option>
                        {albums.map((album) => (
                            <option key={album.id} value={album.id}>{album.name}</option>
                        ))}
                    </select>
                    {form.errors.album_id ? <div className="mt-1 text-xs text-red-700">{form.errors.album_id}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Código</label>
                    <input className="mt-1 w-full rounded-sm border px-2 py-2 text-sm font-mono" value={form.data.code} onChange={(event) => form.setData('code', event.target.value)} />
                    {form.errors.code ? <div className="mt-1 text-xs text-red-700">{form.errors.code}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Título</label>
                    <input className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} />
                    {form.errors.title ? <div className="mt-1 text-xs text-red-700">{form.errors.title}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Canal</label>
                    <select className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.source_channel} onChange={(event) => form.setData('source_channel', event.target.value)}>
                        {channels.map((channel) => (
                            <option key={channel} value={channel}>{channel}</option>
                        ))}
                    </select>
                    {form.errors.source_channel ? <div className="mt-1 text-xs text-red-700">{form.errors.source_channel}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Status</label>
                    <select className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>
                        {statuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    {form.errors.status ? <div className="mt-1 text-xs text-red-700">{form.errors.status}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Pacotes por resgate</label>
                    <input type="number" min={0} max={10} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.reward_pack_quantity} onChange={(event) => form.setData('reward_pack_quantity', Number(event.target.value))} />
                    {form.errors.reward_pack_quantity ? <div className="mt-1 text-xs text-red-700">{form.errors.reward_pack_quantity}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Tamanho do pacote</label>
                    <input type="number" min={1} max={10} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.reward_pack_size} onChange={(event) => form.setData('reward_pack_size', Number(event.target.value))} />
                    {form.errors.reward_pack_size ? <div className="mt-1 text-xs text-red-700">{form.errors.reward_pack_size}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Início</label>
                    <input type="datetime-local" className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.starts_at} onChange={(event) => form.setData('starts_at', event.target.value)} />
                    {form.errors.starts_at ? <div className="mt-1 text-xs text-red-700">{form.errors.starts_at}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Expira em</label>
                    <input type="datetime-local" className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.expires_at} onChange={(event) => form.setData('expires_at', event.target.value)} />
                    {form.errors.expires_at ? <div className="mt-1 text-xs text-red-700">{form.errors.expires_at}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Limite total</label>
                    <input type="number" min={1} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.max_total_redemptions} onChange={(event) => form.setData('max_total_redemptions', event.target.value === '' ? '' : Number(event.target.value))} />
                    {form.errors.max_total_redemptions ? <div className="mt-1 text-xs text-red-700">{form.errors.max_total_redemptions}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Limite por usuário</label>
                    <input type="number" min={1} max={10} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.max_redemptions_per_user} onChange={(event) => form.setData('max_redemptions_per_user', Number(event.target.value))} />
                    {form.errors.max_redemptions_per_user ? <div className="mt-1 text-xs text-red-700">{form.errors.max_redemptions_per_user}</div> : null}
                </div>
            </div>

            <div>
                <label className="text-xs uppercase text-muted-foreground">Descrição</label>
                <textarea className="mt-1 min-h-24 w-full rounded-sm border px-2 py-2 text-sm" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} />
                {form.errors.description ? <div className="mt-1 text-xs text-red-700">{form.errors.description}</div> : null}
            </div>

            <div className="rounded-sm border bg-zinc-50 p-3 text-xs text-muted-foreground">
                Use este código em stories/posts para direcionar resgate manual no app. Não há integração oficial com Instagram nesta etapa.
            </div>

            <div className="flex justify-end">
                <button type="submit" disabled={form.processing} className="rounded-sm border bg-black px-3 py-2 text-sm text-white">{submitLabel}</button>
            </div>
        </form>
    );
}
