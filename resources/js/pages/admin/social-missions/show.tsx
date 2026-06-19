import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { fmtDateTimeBr } from '@/lib/date';
import { PromptDialog } from '@/components/ui/action-dialog';

const AUDIT_PREVIEW_LIMIT = 40;

type Submission = {
    id: number;
    status: string;
    evidence_text: string | null;
    evidence_url: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
    user: { id: number; email: string };
    reviewer: { id: number; email: string } | null;
};

type Mission = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    instructions: string | null;
    type: string;
    status: string;
    reward_pack_quantity: number;
    reward_pack_size: number;
    starts_at: string | null;
    ends_at: string | null;
    approved_count: number;
    submissions_pending_count: number;
    submissions_approved_count: number;
    submissions_rejected_count: number;
    team: { id: number; name: string };
    album: { id: number; name: string; status: string };
    submissions: Submission[];
};

type AuditLog = { id: number; action: string; created_at: string | null; metadata: Record<string, unknown> | null; actor: { email: string } | null };

export default function AdminSocialMissionShow({ mission, shareText, auditLogs }: { mission: Mission; shareText: string; auditLogs: AuditLog[] }) {
    const [cancelOpen, setCancelOpen] = useState(false);

    const totalSubmissions =
        mission.submissions_pending_count +
        mission.submissions_approved_count +
        mission.submissions_rejected_count;
    const submissionsTruncated = mission.submissions.length < totalSubmissions;
    const auditTruncated = auditLogs.length >= AUDIT_PREVIEW_LIMIT;

    const activate = () => router.patch(`/admin/social-missions/${mission.id}/activate`);
    const closeMission = () => router.patch(`/admin/social-missions/${mission.id}/close`);
    const cancel = () => {
        setCancelOpen(true);
    };

    return (
        <>
            <Head title={`Missão ${mission.title}`} />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h1 className="text-xl font-semibold tracking-tight">{mission.title}</h1>
                    <div className="flex gap-2">
                        {mission.status === 'draft' && (
                            <Link href={`/admin/social-missions/${mission.id}/edit`} className="cursor-pointer rounded-sm border px-3 py-2 text-xs transition-colors hover:bg-accent">Editar</Link>
                        )}
                        <button type="button" onClick={activate} className="cursor-pointer rounded-sm border px-3 py-2 text-xs transition-colors hover:bg-accent">Ativar</button>
                        <button type="button" onClick={closeMission} className="cursor-pointer rounded-sm border px-3 py-2 text-xs transition-colors hover:bg-accent">Fechar</button>
                        <button type="button" onClick={cancel} className="cursor-pointer rounded-sm border px-3 py-2 text-xs transition-colors hover:bg-accent">Cancelar</button>
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Status:</span> {mission.status}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Tipo:</span> {mission.type}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Recompensa:</span> {mission.reward_pack_quantity}x{mission.reward_pack_size}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Pendentes:</span> {mission.submissions_pending_count}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Aprovadas:</span> {mission.submissions_approved_count}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Rejeitadas:</span> {mission.submissions_rejected_count}</div>
                </div>

                <div className="rounded-sm border p-4">
                    <div className="text-xs uppercase text-muted-foreground">Instruções</div>
                    <p className="mt-2 whitespace-pre-wrap text-sm">{mission.instructions ?? '-'}</p>
                </div>

                <div className="rounded-sm border p-4">
                    <div className="text-xs uppercase text-muted-foreground">Texto sugerido para Instagram</div>
                    <pre className="mt-2 whitespace-pre-wrap text-sm">{shareText}</pre>
                </div>

                <div className="rounded-sm border">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                        <span className="text-sm font-medium">Submissões</span>
                        <Link
                            href={`/admin/social-mission-submissions?mission_id=${mission.id}`}
                            className="text-xs underline"
                        >
                            Ver todas ({totalSubmissions})
                        </Link>
                    </div>
                    {submissionsTruncated && (
                        <div className="border-b bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                            Mostrando as {mission.submissions.length} submissões mais recentes de {totalSubmissions}. Use o botão Ver todas para a lista completa.
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="px-4 py-2">ID</th>
                                    <th className="px-4 py-2">Participante</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">Data</th>
                                    <th className="px-4 py-2">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mission.submissions.map((submission) => (
                                    <tr key={submission.id} className="border-b">
                                        <td className="px-4 py-2">#{submission.id}</td>
                                        <td className="px-4 py-2">{submission.user.email}</td>
                                        <td className="px-4 py-2">{submission.status}</td>
                                        <td className="px-4 py-2">{fmtDateTimeBr(submission.submitted_at)}</td>
                                        <td className="px-4 py-2">
                                            <Link href={`/admin/social-mission-submissions/${submission.id}`} className="text-xs underline">Analisar</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rounded-sm border">
                    <div className="border-b px-4 py-3 text-sm font-medium">Auditoria</div>
                    {auditTruncated && (
                        <div className="border-b bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                            Mostrando os {AUDIT_PREVIEW_LIMIT} eventos mais recentes (missão + submissões).
                        </div>
                    )}
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
                title="Cancelar missão"
                label="Motivo do cancelamento"
                required={true}
                destructive={true}
                confirmLabel="Cancelar missão"
                onConfirm={(reason) => {
                    setCancelOpen(false);
                    router.patch(`/admin/social-missions/${mission.id}/cancel`, { cancellation_reason: reason });
                }}
                onCancel={() => setCancelOpen(false)}
            />
        </>
    );
}
