import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { fmtDateTimeBr } from '@/lib/date';
import { PageHeader } from '@/components/ui/page-header';

type Flash = {
    success?: string;
    eventCheckinResult?: {
        checkin_id: number;
        pack_ids: number[];
        distance_meters: number;
        accuracy_meters: number;
    };
};

type Props = {
    token: string;
    event: {
        id: number;
        title: string;
        description: string | null;
        status: string;
        location_name: string | null;
        latitude: number | null;
        longitude: number | null;
        radius_meters: number;
        max_accuracy_meters: number;
        event_timezone: string;
        starts_at: string | null;
        ends_at: string | null;
        reward_pack_quantity: number;
        reward_pack_size: number;
    } | null;
    status: 'available' | 'already' | 'expired' | 'not_started' | 'unavailable';
    message: string;
    alreadyCheckedIn: boolean;
};

export default function EventCheckinPage({ token, event, status, message, alreadyCheckedIn }: Props) {
    const page = usePage<{ flash?: Flash; errors: Record<string, string> }>();
    const [requestingLocation, setRequestingLocation] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const canConfirm = status === 'available' && !alreadyCheckedIn;

    const confirm = () => {
        if (!canConfirm) {
            return;
        }

        if (!('geolocation' in navigator)) {
            setLocalError('Não foi possível acessar sua localização. Permita o acesso para confirmar presença.');

            return;
        }

        setLocalError(null);
        setRequestingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                router.post(`/checkin/event/${token}/confirm`, {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: Math.round(position.coords.accuracy),
                }, {
                    onFinish: () => setRequestingLocation(false),
                });
            },
            () => {
                setRequestingLocation(false);
                setLocalError('Não foi possível acessar sua localização. Permita o acesso para confirmar presença.');
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            },
        );
    };

    return (
        <>
            <Head title="Check-in de Evento" />
            <div className="brand-app-bg mx-auto max-w-3xl space-y-4 p-4 sm:p-5">
                <PageHeader title="Check-in de Evento" subtitle="Confirme presença no local para resgatar seu pacote." />

                {!event ? (
                    <div className="album-paper p-4 text-sm">{message}</div>
                ) : (
                    <>
                        <section className="campaign-panel text-sm">
                            <p className="text-[10px] font-semibold tracking-[0.14em] text-dim uppercase">Evento presencial</p>
                            <p className="mt-1 text-foreground">{event.title}</p>
                        </section>

                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="album-paper p-4 text-sm"><span className="text-dim">Local:</span> {event.location_name ?? '-'}</div>
                            <div className="album-paper p-4 text-sm">
                                <span className="text-dim">Janela:</span>{' '}
                                {fmtDateTimeBr(event.starts_at, event.event_timezone)} até {fmtDateTimeBr(event.ends_at, event.event_timezone)}
                            </div>
                            <div className="album-paper p-4 text-sm"><span className="text-dim">Raio permitido:</span> {event.radius_meters}m</div>
                            <div className="album-paper p-4 text-sm"><span className="text-dim">Precisão máxima:</span> {event.max_accuracy_meters}m</div>
                            <div className="album-paper p-4 text-sm"><span className="text-dim">Recompensa:</span> {event.reward_pack_quantity} pacote(s) de {event.reward_pack_size}</div>
                            <div className="album-paper p-4 text-sm"><span className="text-dim">Fuso:</span> {event.event_timezone}</div>
                        </div>

                        {event.description ? <div className="mission-ticket text-sm">{event.description}</div> : null}

                        <div className="mission-ticket text-sm">{message}</div>

                        {page.props.flash?.success ? (
                            <div className="rounded-md border border-[color:var(--brand-secondary)]/45 bg-[color:var(--brand-secondary)]/12 p-4 text-sm text-foreground">
                                <div className="font-medium">{page.props.flash.success}</div>
                                <div className="mt-2 text-dim">Pacotes gerados: {(page.props.flash.eventCheckinResult?.pack_ids ?? []).join(', ') || '-'}</div>
                                <div className="mt-1 text-dim">Distância validada: {page.props.flash.eventCheckinResult?.distance_meters ?? '-'}m</div>
                                <div className="mt-2 flex gap-3">
                                    <Link className="underline" href="/packs">Ir para meus pacotes</Link>
                                    <Link className="underline" href="/checkins">Ir para meus check-ins</Link>
                                </div>
                            </div>
                        ) : null}

                        {page.props.errors.checkin ? (
                            <div className="rounded-sm border border-red-300 bg-red-50 p-3 text-sm text-red-700">{page.props.errors.checkin}</div>
                        ) : null}

                        {localError ? (
                            <div className="rounded-sm border border-red-300 bg-red-50 p-3 text-sm text-red-700">{localError}</div>
                        ) : null}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                disabled={!canConfirm || requestingLocation}
                                onClick={confirm}
                                className="rounded-sm border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:border-border disabled:bg-muted disabled:text-dim"
                            >
                                {requestingLocation ? 'Obtendo localização...' : 'Confirmar presença'}
                            </button>
                            <Link href="/checkins" className="rounded-sm border border-border bg-card px-4 py-2 text-sm font-medium">Meu histórico</Link>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
