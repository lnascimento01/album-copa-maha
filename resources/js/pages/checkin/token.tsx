import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/page-header';

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
            <div className="brand-app-bg mx-auto max-w-3xl space-y-4 p-4 sm:p-5">
                <PageHeader title="Check-in por QR Code" subtitle="Confirme presença para desbloquear pacotes da temporada AAPH." />

                {!activity || !session ? (
                    <div className="album-paper p-4 text-sm">{message}</div>
                ) : (
                    <>
                        <section className="campaign-panel text-sm">
                            <p className="text-[10px] font-semibold tracking-[0.14em] text-dim uppercase">Leitura de credencial</p>
                            <p className="mt-1 text-foreground">Sessão ativa para validação de presença na atividade da temporada.</p>
                        </section>

                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="album-paper p-4 text-sm"><span className="text-dim">Atividade:</span> {activity.title}</div>
                            <div className="album-paper p-4 text-sm"><span className="text-dim">Tipo:</span> {activity.type}</div>
                            <div className="album-paper p-4 text-sm"><span className="text-dim">Status:</span> {activity.status}</div>
                            <div className="album-paper p-4 text-sm"><span className="text-dim">Recompensa:</span> {activity.reward_pack_quantity} pacote(s) de {activity.reward_pack_size}</div>
                            <div className="album-paper p-4 text-sm"><span className="text-dim">Expira em:</span> {session.expires_at ?? '-'}</div>
                            <div className="album-paper p-4 text-sm"><span className="text-dim">Usos:</span> {session.used_count}{session.max_uses ? `/${session.max_uses}` : ''}</div>
                        </div>

                        <div className="mission-ticket text-sm">{message}</div>

                        {page.props.flash?.success ? (
                            <div className="rounded-md border border-[color:var(--brand-secondary)]/45 bg-[color:var(--brand-secondary)]/12 p-4 text-sm text-foreground">
                                <div className="font-medium">{page.props.flash.success}</div>
                                <div className="mt-2 text-dim">Pacotes gerados: {(page.props.flash.selfCheckinResult?.pack_ids ?? []).join(', ') || '-'}</div>
                                <div className="mt-2 flex gap-3">
                                    <Link className="underline" href="/packs">Ir para meus pacotes</Link>
                                    <Link className="underline" href="/album">Ir para meu álbum</Link>
                                    <Link className="underline" href="/checkins">Ir para meus check-ins</Link>
                                </div>
                            </div>
                        ) : null}

                        <div className="flex gap-3">
                            <button type="button" disabled={!canConfirm} onClick={confirm} className="rounded-sm border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:border-border disabled:bg-muted disabled:text-dim">
                                Confirmar presença
                            </button>
                            <Link href="/checkin-code" className="rounded-sm border border-border bg-card px-4 py-2 text-sm font-medium">Usar código manual</Link>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
