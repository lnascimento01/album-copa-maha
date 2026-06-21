import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { PromptDialog } from '@/components/ui/action-dialog';
import { fmtDateTimeBr } from '@/lib/date';

type Sticker = { id: number; code: string; title: string; type: string; rarity: string };

type PackItem = { id: number; created_at: string | null; sticker: Sticker };

type UserRef = { id: number; name: string; email: string };

type Pack = {
    id: number;
    status: string;
    source: string;
    size: number;
    metadata: Record<string, unknown> | null;
    opened_at: string | null;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    created_at: string | null;
    user: UserRef;
    album: { id: number; name: string; slug: string };
    activity?: { id: number; title: string; type: string; status: string } | null;
    activity_checkin_id?: number | null;
    reward_code?: { id: number; code: string; title: string; status: string } | null;
    reward_code_redemption_id?: number | null;
    social_mission?: { id: number; title: string; slug: string; status: string } | null;
    social_mission_submission_id?: number | null;
    granted_by_user: UserRef | null;
    items: PackItem[];
};

type AuditLog = {
    id: number;
    action: string;
    metadata: Record<string, unknown> | null;
    created_at: string | null;
    actor: UserRef | null;
    target: UserRef | null;
};

export default function AdminStickerPackShow({ pack, auditLogs, canCancel, canRevoke }: { pack: Pack; auditLogs: AuditLog[]; canCancel: boolean; canRevoke: boolean }) {
    const [cancelOpen, setCancelOpen] = useState(false);
    const [revokeOpen, setRevokeOpen] = useState(false);

    const cancel = () => {
        setCancelOpen(true);
    };

    const revoke = () => {
        setRevokeOpen(true);
    };

    return (
        <>
            <Head title={`Pacote #${pack.id}`} />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-xl font-semibold tracking-tight">Pacote #{pack.id}</h1>
                    <div className="flex gap-2">
                        {canCancel && pack.status === 'pending' ? (
                            <button type="button" className="cursor-pointer rounded-sm border px-3 py-2 text-xs transition-colors hover:bg-accent" onClick={cancel}>Cancelar pacote</button>
                        ) : null}
                        {canRevoke && pack.status !== 'cancelled' ? (
                            <button type="button" className="cursor-pointer rounded-sm border border-red-600 px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950" onClick={revoke}>Revogar pacote</button>
                        ) : null}
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Usuário:</span> {pack.user.email}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Álbum:</span> {pack.album.name}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Status:</span> {pack.status}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Tamanho:</span> {pack.size}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Source:</span> {pack.source}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Atividade:</span> {pack.activity?.title ?? '-'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Check-in:</span> {pack.activity_checkin_id ? `#${pack.activity_checkin_id}` : '-'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Código:</span> {pack.reward_code?.code ?? '-'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Resgate código:</span> {pack.reward_code_redemption_id ? `#${pack.reward_code_redemption_id}` : '-'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Missão social:</span> {pack.social_mission?.title ?? '-'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Submissão social:</span> {pack.social_mission_submission_id ? `#${pack.social_mission_submission_id}` : '-'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Concedido por:</span> {pack.granted_by_user?.email ?? '-'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Criado em:</span> {fmtDateTimeBr(pack.created_at)}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Aberto em:</span> {fmtDateTimeBr(pack.opened_at)}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Cancelado em:</span> {fmtDateTimeBr(pack.cancelled_at)}</div>
                </div>

                <div className="rounded-sm border p-4">
                    <div className="mb-2 text-xs uppercase text-muted-foreground">Metadata</div>
                    <pre className="overflow-x-auto text-xs">{JSON.stringify(pack.metadata ?? {}, null, 2)}</pre>
                </div>

                {pack.items.length > 0 ? (
                    <div className="rounded-sm border">
                        <div className="border-b px-4 py-3 text-sm font-medium">Figurinhas do pacote</div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-4 py-2">Código</th>
                                        <th className="px-4 py-2">Título</th>
                                        <th className="px-4 py-2">Tipo</th>
                                        <th className="px-4 py-2">Raridade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pack.items.map((item) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="px-4 py-2 font-mono text-xs">{item.sticker.code}</td>
                                            <td className="px-4 py-2">{item.sticker.title}</td>
                                            <td className="px-4 py-2">{item.sticker.type}</td>
                                            <td className="px-4 py-2">{item.sticker.rarity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : null}

                <div className="rounded-sm border">
                    <div className="border-b px-4 py-3 text-sm font-medium">Auditoria do pacote</div>
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
                                        <td className="px-4 py-2">{fmtDateTimeBr(log.created_at)}</td>
                                        <td className="px-4 py-2"><pre className="max-w-[420px] overflow-x-auto text-xs">{JSON.stringify(log.metadata ?? {}, null, 2)}</pre></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <PromptDialog
                open={cancelOpen}
                title="Cancelar pacote"
                label="Motivo do cancelamento"
                required={true}
                destructive={true}
                confirmLabel="Cancelar pacote"
                onConfirm={(reason) => {
                    setCancelOpen(false);
                    router.patch(`/admin/sticker-packs/${pack.id}/cancel`, { cancellation_reason: reason });
                }}
                onCancel={() => setCancelOpen(false)}
            />

            <PromptDialog
                open={revokeOpen}
                title={`Revogar pacote #${pack.id}`}
                label="Motivo da revogação"
                description={`Isso irá remover as figurinhas do álbum do usuário, recalcular conquistas e cancelar o pacote. Status atual: ${pack.status}. Esta ação não pode ser desfeita.`}
                required={true}
                destructive={true}
                confirmLabel="Revogar pacote"
                onConfirm={(reason) => {
                    setRevokeOpen(false);
                    router.delete(`/admin/sticker-packs/${pack.id}`, { data: { cancellation_reason: reason } });
                }}
                onCancel={() => setRevokeOpen(false)}
            />
        </>
    );
}
