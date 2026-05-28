import { Head, Link, router, usePage } from '@inertiajs/react';

type Flash = {
    success?: string;
    selfCheckinResult?: {
        checkin_id: number;
        pack_ids: number[];
    };
};

type Props = {
    session: {
        id: number;
        status: string;
        public_code: string | null;
        starts_at: string | null;
        expires_at: string | null;
        max_uses: number | null;
        used_count: number;
    } | null;
    activity: {
        id: number;
        title: string;
        type: string;
        status: string;
        starts_at: string | null;
        reward_pack_quantity: number;
        reward_pack_size: number;
        team: { id: number; name: string };
    } | null;
    status: 'available' | 'already' | 'expired' | 'not_started' | 'full' | 'unavailable';
    message: string;
    alreadyCheckedIn: boolean;
};

export default function CheckinTokenPage({ session, activity, status, message, alreadyCheckedIn }: Props) {
    const page = usePage<{ flash?: Flash }>();
    const token = typeof window !== 'undefined' ? window.location.pathname.split('/')[2] : '';

    const confirm = () => {
        router.post(`/checkin/${token}/confirm`);
    };

    const canConfirm = status === 'available' && !alreadyCheckedIn;

    return (
        <>
            <Head title="Check-in por QR" />
            <div className="mx-auto max-w-3xl space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Check-in por QR Code</h1>

                {!activity || !session ? (
                    <div className="rounded-sm border p-4 text-sm">{message}</div>
                ) : (
                    <>
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Atividade:</span> {activity.title}</div>
                            <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Tipo:</span> {activity.type}</div>
                            <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Status:</span> {activity.status}</div>
                            <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Recompensa:</span> {activity.reward_pack_quantity} pacote(s) de {activity.reward_pack_size}</div>
                            <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Expira em:</span> {session.expires_at ?? '-'}</div>
                            <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Usos:</span> {session.used_count}{session.max_uses ? `/${session.max_uses}` : ''}</div>
                        </div>

                        <div className="rounded-sm border p-4 text-sm">{message}</div>

                        {page.props.flash?.success ? (
                            <div className="rounded-sm border border-emerald-600 bg-emerald-50 p-4 text-sm text-emerald-800">
                                <div className="font-medium">{page.props.flash.success}</div>
                                <div className="mt-2">Pacotes gerados: {(page.props.flash.selfCheckinResult?.pack_ids ?? []).join(', ') || '-'}</div>
                                <div className="mt-2 flex gap-3">
                                    <Link className="underline" href="/packs">Ir para meus pacotes</Link>
                                    <Link className="underline" href="/album">Ir para meu álbum</Link>
                                    <Link className="underline" href="/checkins">Ir para meus check-ins</Link>
                                </div>
                            </div>
                        ) : null}

                        <div className="flex gap-3">
                            <button type="button" disabled={!canConfirm} onClick={confirm} className="rounded-sm border bg-primary px-4 py-2 text-sm text-primary-foreground disabled:bg-zinc-400">
                                Confirmar presença
                            </button>
                            <Link href="/checkin-code" className="rounded-sm border px-4 py-2 text-sm">Usar código manual</Link>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
