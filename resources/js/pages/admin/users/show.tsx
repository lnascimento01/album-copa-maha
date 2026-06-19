import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { fmtDateTimeBr } from '@/lib/date';
import { ConfirmDialog, PromptDialog } from '@/components/ui/action-dialog';

type Role = {
    id: number;
    name: string;
    slug: string;
};

type Permission = {
    id: number;
    name: string;
    slug: string;
    group: string;
};

type AuditLog = {
    id: number;
    action: string;
    entity_type: string | null;
    entity_id: number | null;
    metadata: Record<string, unknown> | null;
    created_at: string | null;
    actor: { id: number; name: string; email: string } | null;
    target: { id: number; name: string; email: string } | null;
};

type Props = {
    userDetail: {
        id: number;
        name: string;
        email: string;
        approval_status: string;
        approved_at: string | null;
        approved_by: number | null;
        rejected_at: string | null;
        rejected_by: number | null;
        rejection_reason: string | null;
        roles: Role[];
        permissions: Permission[];
    };
    auditLogs: AuditLog[];
    canApprove: boolean;
    canReject: boolean;
    canSuspend: boolean;
    canResetStickers: boolean;
};

export default function AdminUserShow({ userDetail, auditLogs, canApprove, canReject, canSuspend, canResetStickers }: Props) {
    const [rejectOpen, setRejectOpen] = useState(false);
    const [suspendOpen, setSuspendOpen] = useState(false);
    const [resetStickersOpen, setResetStickersOpen] = useState(false);

    const approve = () => {
        router.patch(`/admin/users/${userDetail.id}/approve`);
    };

    const reject = () => {
        setRejectOpen(true);
    };

    const suspend = () => {
        setSuspendOpen(true);
    };

    const resetStickers = () => {
        setResetStickersOpen(true);
    };

    return (
        <>
            <Head title={`Usuário: ${userDetail.name}`} />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Detalhe de Usuário</h1>

                <div className="rounded-sm border p-4">
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                        <div>
                            <div className="text-xs uppercase text-muted-foreground">Nome</div>
                            <div>{userDetail.name}</div>
                        </div>
                        <div>
                            <div className="text-xs uppercase text-muted-foreground">E-mail</div>
                            <div className="font-mono text-xs">{userDetail.email}</div>
                        </div>
                        <div>
                            <div className="text-xs uppercase text-muted-foreground">Status</div>
                            <div>{userDetail.approval_status}</div>
                        </div>
                        <div>
                            <div className="text-xs uppercase text-muted-foreground">Rejeição</div>
                            <div>{userDetail.rejection_reason ?? '-'}</div>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {canApprove ? (
                            <button type="button" className="cursor-pointer rounded-sm border px-2 py-1 text-xs transition-colors hover:bg-accent" onClick={approve}>
                                Aprovar
                            </button>
                        ) : null}
                        {canReject ? (
                            <button type="button" className="cursor-pointer rounded-sm border px-2 py-1 text-xs transition-colors hover:bg-accent" onClick={reject}>
                                Rejeitar
                            </button>
                        ) : null}
                        {canSuspend ? (
                            <button type="button" className="cursor-pointer rounded-sm border px-2 py-1 text-xs transition-colors hover:bg-accent" onClick={suspend}>
                                Suspender
                            </button>
                        ) : null}
                        {canResetStickers ? (
                            <button type="button" className="rounded-sm border border-red-600 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={resetStickers}>
                                Resetar figurinhas
                            </button>
                        ) : null}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-sm border p-4">
                        <div className="text-xs uppercase text-muted-foreground">Roles</div>
                        <ul className="mt-2 space-y-1 text-sm">
                            {userDetail.roles.map((role) => (
                                <li key={role.id}>{role.slug}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-sm border p-4">
                        <div className="text-xs uppercase text-muted-foreground">Permissões efetivas</div>
                        <ul className="mt-2 space-y-1 text-sm">
                            {userDetail.permissions.map((permission) => (
                                <li key={permission.id} className="font-mono text-xs">
                                    {permission.slug}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="rounded-sm border">
                    <div className="border-b px-4 py-3 text-sm font-medium">Últimos audit logs relacionados</div>
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
                                        <td className="px-4 py-2">
                                            <pre className="max-w-[360px] overflow-x-auto whitespace-pre-wrap text-xs">
                                                {JSON.stringify(log.metadata ?? {}, null, 2)}
                                            </pre>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <PromptDialog
                open={rejectOpen}
                title="Rejeitar usuário"
                label="Motivo da rejeição"
                required={true}
                destructive={true}
                confirmLabel="Rejeitar"
                onConfirm={(reason) => {
                    setRejectOpen(false);
                    router.patch(`/admin/users/${userDetail.id}/reject`, { rejection_reason: reason });
                }}
                onCancel={() => setRejectOpen(false)}
            />

            <ConfirmDialog
                open={suspendOpen}
                title="Suspender usuário"
                message="Confirma suspender este usuário?"
                destructive={true}
                confirmLabel="Suspender"
                onConfirm={() => {
                    setSuspendOpen(false);
                    router.patch(`/admin/users/${userDetail.id}/suspend`);
                }}
                onCancel={() => setSuspendOpen(false)}
            />

            <ConfirmDialog
                open={resetStickersOpen}
                title="Resetar figurinhas"
                message={`Resetar todo o histórico de figurinhas de ${userDetail.name}? Os registros serão mantidos com soft delete.`}
                destructive={true}
                confirmLabel="Resetar"
                onConfirm={() => {
                    setResetStickersOpen(false);
                    router.delete(`/admin/users/${userDetail.id}/stickers/reset`);
                }}
                onCancel={() => setResetStickersOpen(false)}
            />
        </>
    );
}
