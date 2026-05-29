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
    location_name: string;
    latitude: string;
    longitude: string;
    radius_meters: number;
    max_accuracy_meters: number;
    event_timezone: string;
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
        location_name: initialValues.location_name,
        latitude: initialValues.latitude,
        longitude: initialValues.longitude,
        radius_meters: initialValues.radius_meters,
        max_accuracy_meters: initialValues.max_accuracy_meters,
        event_timezone: initialValues.event_timezone,
        starts_at: initialValues.starts_at,
        ends_at: initialValues.ends_at,
        reward_pack_quantity: initialValues.reward_pack_quantity,
        reward_pack_size: initialValues.reward_pack_size,
    });

    const isEvent = form.data.type === 'event';

    const typeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            training: 'Treino',
            match: 'Partida',
            event: 'Evento presencial',
            social: 'Missão social',
            manual: 'Manual',
        };

        return labels[type] ?? type;
    };

    const handleTypeChange = (value: string) => {
        form.setData((current) => ({
            ...current,
            type: value,
            radius_meters: value === 'event' && (!current.radius_meters || current.radius_meters < 30) ? 150 : current.radius_meters,
            max_accuracy_meters: value === 'event' && (!current.max_accuracy_meters || current.max_accuracy_meters < 10) ? 100 : current.max_accuracy_meters,
            event_timezone: value === 'event' && current.event_timezone.trim() === '' ? 'America/Sao_Paulo' : current.event_timezone,
        }));
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
                        onChange={(event) => handleTypeChange(event.target.value)}
                        className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                    >
                        {types.map((type) => (
                            <option key={type} value={type}>{typeLabel(type)}</option>
                        ))}
                    </select>
                    {form.errors.type ? <div className="mt-1 text-xs text-red-700">{form.errors.type}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">
                        {isEvent ? 'Início do check-in' : 'Início da atividade'}
                    </label>
                    <input
                        type="datetime-local"
                        value={form.data.starts_at}
                        onChange={(event) => form.setData('starts_at', event.target.value)}
                        className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                    />
                    {isEvent ? <div className="mt-1 text-xs text-muted-foreground">Horário inicial para confirmar presença.</div> : null}
                    {form.errors.starts_at ? <div className="mt-1 text-xs text-red-700">{form.errors.starts_at}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">
                        {isEvent ? 'Fim do check-in' : 'Fim da atividade'}
                    </label>
                    <input
                        type="datetime-local"
                        value={form.data.ends_at}
                        onChange={(event) => form.setData('ends_at', event.target.value)}
                        className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                    />
                    {isEvent ? <div className="mt-1 text-xs text-muted-foreground">Horário limite para confirmar presença.</div> : null}
                    {form.errors.ends_at ? <div className="mt-1 text-xs text-red-700">{form.errors.ends_at}</div> : null}
                </div>

                <div>
                    <label className="text-xs uppercase text-muted-foreground">Quantidade de pacotes</label>
                    <input
                        type="number"
                        min={isEvent ? 1 : 0}
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

            {isEvent ? (
                <div className="grid gap-3 rounded-sm border p-3 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <h2 className="text-sm font-semibold tracking-tight">Check-in por evento</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Esses dados serão usados para validar se o participante está no local do evento durante a janela de check-in.
                        </p>
                    </div>

                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Nome do local</label>
                        <input
                            value={form.data.location_name}
                            onChange={(event) => form.setData('location_name', event.target.value)}
                            className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                            placeholder="Ginásio AAPH"
                        />
                        {form.errors.location_name ? <div className="mt-1 text-xs text-red-700">{form.errors.location_name}</div> : null}
                    </div>

                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Fuso horário</label>
                        <input
                            value={form.data.event_timezone}
                            onChange={(event) => form.setData('event_timezone', event.target.value)}
                            className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                            placeholder="America/Sao_Paulo"
                        />
                        {form.errors.event_timezone ? <div className="mt-1 text-xs text-red-700">{form.errors.event_timezone}</div> : null}
                    </div>

                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Latitude</label>
                        <input
                            type="number"
                            step="0.0000001"
                            value={form.data.latitude}
                            onChange={(event) => form.setData('latitude', event.target.value)}
                            className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                            placeholder="-25.4284"
                        />
                        {form.errors.latitude ? <div className="mt-1 text-xs text-red-700">{form.errors.latitude}</div> : null}
                    </div>

                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Longitude</label>
                        <input
                            type="number"
                            step="0.0000001"
                            value={form.data.longitude}
                            onChange={(event) => form.setData('longitude', event.target.value)}
                            className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                            placeholder="-49.2733"
                        />
                        {form.errors.longitude ? <div className="mt-1 text-xs text-red-700">{form.errors.longitude}</div> : null}
                    </div>

                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Raio permitido em metros</label>
                        <input
                            type="number"
                            min={30}
                            max={1000}
                            value={form.data.radius_meters}
                            onChange={(event) => form.setData('radius_meters', Number(event.target.value))}
                            className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                        />
                        <div className="mt-1 text-xs text-muted-foreground">Distância máxima entre o participante e o local do evento.</div>
                        {form.errors.radius_meters ? <div className="mt-1 text-xs text-red-700">{form.errors.radius_meters}</div> : null}
                    </div>

                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Precisão máxima do GPS em metros</label>
                        <input
                            type="number"
                            min={10}
                            max={500}
                            value={form.data.max_accuracy_meters}
                            onChange={(event) => form.setData('max_accuracy_meters', Number(event.target.value))}
                            className="mt-1 w-full rounded-sm border px-2 py-2 text-sm"
                        />
                        <div className="mt-1 text-xs text-muted-foreground">Se o GPS estiver mais impreciso que isso, o check-in será recusado.</div>
                        {form.errors.max_accuracy_meters ? <div className="mt-1 text-xs text-red-700">{form.errors.max_accuracy_meters}</div> : null}
                    </div>
                </div>
            ) : null}

            <div>
                <label className="text-xs uppercase text-muted-foreground">Descrição</label>
                <textarea
                    value={form.data.description}
                    onChange={(event) => form.setData('description', event.target.value)}
                    className="mt-1 min-h-24 w-full rounded-sm border px-2 py-2 text-sm"
                />
                {form.errors.description ? <div className="mt-1 text-xs text-red-700">{form.errors.description}</div> : null}
            </div>

            <div className="rounded-sm border bg-muted p-3 text-xs text-muted-foreground">
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
