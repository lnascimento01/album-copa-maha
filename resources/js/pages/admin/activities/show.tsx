import { Head, Link, router, usePage } from '@inertiajs/react';
import { lazy, Suspense, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

type UserRef = { id: number; name: string; email: string };

type CheckinRow = {
    id: number;
    status: string;
    checked_at: string | null;
    revoked_at: string | null;
    revoke_reason: string | null;
    notes: string | null;
    sticker_packs_count: number;
    user: UserRef;
    checked_by: UserRef | null;
    revoked_by: UserRef | null;
};

type CheckinSessionRow = {
    id: number;
    status: string;
    public_code: string | null;
    starts_at: string | null;
    expires_at: string | null;
    max_uses: number | null;
    used_count: number;
    revoked_at: string | null;
    revoke_reason: string | null;
    creator: UserRef | null;
    revoked_by: UserRef | null;
};

type FlashProps = {
    success?: string;
    selfCheckin?: {
        session_id: number;
        public_url: string;
        public_code: string | null;
        expires_at: string | null;
    };
};

type Props = {
    activity: {
        id: number;
        title: string;
        slug: string;
        type: string;
        status: string;
        description: string | null;
        starts_at: string | null;
        ends_at: string | null;
        reward_pack_quantity: number;
        reward_pack_size: number;
        checkins_count: number;
        sticker_packs_count: number;
        opened_at: string | null;
        closed_at: string | null;
        cancelled_at: string | null;
        cancellation_reason: string | null;
        team: { id: number; name: string };
        album: { id: number; name: string; status: string };
    };
    checkins: CheckinRow[];
    checkinSessions: CheckinSessionRow[];
    approvedUsers: UserRef[];
    auditLogs: Array<{ id: number; action: string; created_at: string | null; actor: UserRef | null; metadata: Record<string, unknown> | null }>;
    can: {
        open: boolean;
        close: boolean;
        cancel: boolean;
        checkinCreate: boolean;
        checkinRevoke: boolean;
        sessionCreate: boolean;
        sessionRevoke: boolean;
    };
};

const LazyQRCodeSVG = lazy(async () => {
    const module = await import('qrcode.react');

    return { default: module.QRCodeSVG };
});

export default function AdminActivityShow({ activity, checkins, checkinSessions, approvedUsers, auditLogs, can }: Props) {
    const page = usePage<{ flash?: FlashProps }>();
    const createdSession = page.props.flash?.selfCheckin;

    const [userId, setUserId] = useState('');
    const [notes, setNotes] = useState('');

    const [durationMinutes, setDurationMinutes] = useState(15);
    const [maxUses, setMaxUses] = useState('');
    const [sessionStartsAt, setSessionStartsAt] = useState('');
    const [sessionNote, setSessionNote] = useState('');

    const activeSession = useMemo(() => {
        const now = new Date();

        return checkinSessions.find((session) => {
            if (session.status !== 'active') {
                return false;
            }

            if (!session.expires_at) {
                return false;
            }

            return new Date(session.expires_at) >= now;
        }) ?? null;
    }, [checkinSessions]);

    const submitCheckin = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!userId) {
            return;
        }

        router.post(`/admin/activities/${activity.id}/checkins`, {
            user_id: Number(userId),
            notes,
        });
    };

    const submitSession = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.post(`/admin/activities/${activity.id}/checkin-sessions`, {
            duration_minutes: durationMinutes,
            max_uses: maxUses ? Number(maxUses) : null,
            starts_at: sessionStartsAt || null,
            note: sessionNote || null,
        });
    };

    const cancelActivity = () => {
        const reason = window.prompt('Motivo do cancelamento da atividade:');

        if (!reason) {
            return;
        }

        router.patch(`/admin/activities/${activity.id}/cancel`, {
            cancellation_reason: reason,
        });
    };

    const revokeCheckin = (checkinId: number) => {
        const reason = window.prompt('Motivo da revogação:');

        if (!reason) {
            return;
        }

        router.patch(`/admin/activity-checkins/${checkinId}/revoke`, {
            revoke_reason: reason,
        });
    };

    const revokeSession = (sessionId: number) => {
        const reason = window.prompt('Motivo da revogação da sessão:');

        if (!reason) {
            return;
        }

        router.patch(`/admin/activity-checkin-sessions/${sessionId}/revoke`, {
            revoke_reason: reason,
        });
    };

    return (
        <>
            <Head title={`Atividade - ${activity.title}`} />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-xl font-semibold tracking-tight">{activity.title}</h1>
                    <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/activities/${activity.id}/edit`} className="rounded-sm border px-3 py-2 text-xs">Editar</Link>
                        {can.open ? <button type="button" className="rounded-sm border px-3 py-2 text-xs" onClick={() => router.patch(`/admin/activities/${activity.id}/open`)}>Abrir</button> : null}
                        {can.close ? <button type="button" className="rounded-sm border px-3 py-2 text-xs" onClick={() => router.patch(`/admin/activities/${activity.id}/close`)}>Fechar</button> : null}
                        {can.cancel ? <button type="button" className="rounded-sm border px-3 py-2 text-xs" onClick={cancelActivity}>Cancelar</button> : null}
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Time:</span> {activity.team.name}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Álbum:</span> {activity.album.name}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Status:</span> {activity.status}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Tipo:</span> {activity.type}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Início:</span> {activity.starts_at ?? '-'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Fim:</span> {activity.ends_at ?? '-'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Recompensa:</span> {activity.reward_pack_quantity} pacote(s) de {activity.reward_pack_size} figurinhas</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Check-ins confirmados:</span> {activity.checkins_count}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Pacotes gerados:</span> {activity.sticker_packs_count}</div>
                </div>

                <div className="rounded-sm border p-4 text-sm">
                    <div className="mb-2 text-xs uppercase text-muted-foreground">Check-in por QR Code</div>
                    <p className="text-muted-foreground">
                        Qualquer participante aprovado com este QR Code pode confirmar presença enquanto a sessão estiver válida.
                    </p>

                    {createdSession ? (
                        <div className="mt-3 rounded-sm border p-3">
                            <div className="text-xs uppercase text-muted-foreground">Sessão recém-criada (token exibido uma única vez)</div>
                            <div className="mt-1 text-sm"><span className="font-medium">Link:</span> {createdSession.public_url}</div>
                            <div className="text-sm"><span className="font-medium">Código:</span> {createdSession.public_code ?? '-'}</div>
                            <div className="mt-2 inline-block rounded-sm border bg-white p-2">
                                <Suspense fallback={<div className="h-[140px] w-[140px] text-xs text-muted-foreground">Gerando QR...</div>}>
                                    <LazyQRCodeSVG value={createdSession.public_url} size={140} />
                                </Suspense>
                            </div>
                        </div>
                    ) : null}

                    {activeSession ? (
                        <div className="mt-3 rounded-sm border p-3 text-sm">
                            <div><span className="text-muted-foreground">Sessão ativa:</span> #{activeSession.id}</div>
                            <div><span className="text-muted-foreground">Código:</span> {activeSession.public_code ?? '-'}</div>
                            <div><span className="text-muted-foreground">Expira em:</span> {activeSession.expires_at ?? '-'}</div>
                            <div><span className="text-muted-foreground">Usos:</span> {activeSession.used_count}{activeSession.max_uses ? `/${activeSession.max_uses}` : ''}</div>
                            {can.sessionRevoke ? (
                                <button type="button" onClick={() => revokeSession(activeSession.id)} className="mt-2 rounded-sm border px-3 py-2 text-xs">
                                    Revogar sessão ativa
                                </button>
                            ) : null}
                        </div>
                    ) : (
                        <div className="mt-3 text-sm text-muted-foreground">Sem sessão ativa no momento.</div>
                    )}

                    {can.sessionCreate ? (
                        <form onSubmit={submitSession} className="mt-3 grid gap-3 rounded-sm border p-3 md:grid-cols-4">
                            <div>
                                <label className="text-xs uppercase text-muted-foreground">Duração (min)</label>
                                <input type="number" min={1} max={240} value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value) || 15)} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs uppercase text-muted-foreground">Max usos</label>
                                <input type="number" min={1} value={maxUses} onChange={(event) => setMaxUses(event.target.value)} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" placeholder="Opcional" />
                            </div>
                            <div>
                                <label className="text-xs uppercase text-muted-foreground">Início (opcional)</label>
                                <input type="datetime-local" value={sessionStartsAt} onChange={(event) => setSessionStartsAt(event.target.value)} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs uppercase text-muted-foreground">Observação</label>
                                <input value={sessionNote} onChange={(event) => setSessionNote(event.target.value)} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" />
                            </div>
                            <div className="md:col-span-4 flex justify-end">
                                <button disabled={activity.status !== 'open'} type="submit" className="rounded-sm border bg-black px-3 py-2 text-sm text-white disabled:bg-zinc-400">
                                    Gerar sessão de check-in
                                </button>
                            </div>
                            {activity.status !== 'open' ? (
                                <div className="md:col-span-4 text-xs text-red-700">A atividade precisa estar aberta para gerar sessão de check-in.</div>
                            ) : null}
                        </form>
                    ) : null}
                </div>

                {can.checkinCreate ? (
                    <form onSubmit={submitCheckin} className="grid gap-3 rounded-sm border p-4 md:grid-cols-4">
                        <div>
                            <label className="text-xs uppercase text-muted-foreground">Participante aprovado</label>
                            <select value={userId} onChange={(event) => setUserId(event.target.value)} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm">
                                <option value="">Selecione</option>
                                {approvedUsers.map((user) => (
                                    <option key={user.id} value={user.id}>{user.email}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs uppercase text-muted-foreground">Notas</label>
                            <input value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full rounded-sm border bg-black px-3 py-2 text-sm text-white">Marcar presença</button>
                        </div>
                    </form>
                ) : null}

                <div className="overflow-x-auto rounded-sm border">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="px-4 py-2">Check-in</th>
                                <th className="px-4 py-2">Participante</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Marcado em</th>
                                <th className="px-4 py-2">Pacotes</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {checkins.map((checkin) => (
                                <tr key={checkin.id} className="border-b">
                                    <td className="px-4 py-2 font-mono text-xs">#{checkin.id}</td>
                                    <td className="px-4 py-2">{checkin.user.email}</td>
                                    <td className="px-4 py-2">{checkin.status}</td>
                                    <td className="px-4 py-2">{checkin.checked_at ?? '-'}</td>
                                    <td className="px-4 py-2">{checkin.sticker_packs_count}</td>
                                    <td className="px-4 py-2">
                                        {can.checkinRevoke && checkin.status === 'confirmed' ? (
                                            <button type="button" className="text-xs underline" onClick={() => revokeCheckin(checkin.id)}>
                                                Revogar
                                            </button>
                                        ) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="rounded-sm border">
                    <div className="border-b px-4 py-3 text-sm font-medium">Auditoria da atividade</div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="px-4 py-2">Ação</th>
                                    <th className="px-4 py-2">Ator</th>
                                    <th className="px-4 py-2">Data</th>
                                    <th className="px-4 py-2">Metadata</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.map((log) => (
                                    <tr key={log.id} className="border-b align-top">
                                        <td className="px-4 py-2 font-mono text-xs">{log.action}</td>
                                        <td className="px-4 py-2">{log.actor?.email ?? '-'}</td>
                                        <td className="px-4 py-2">{log.created_at ?? '-'}</td>
                                        <td className="px-4 py-2"><pre className="max-w-[420px] overflow-x-auto text-xs">{JSON.stringify(log.metadata ?? {}, null, 2)}</pre></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
