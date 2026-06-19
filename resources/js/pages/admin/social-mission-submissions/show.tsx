import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { fmtDateTimeBr } from '@/lib/date';
import { PromptDialog } from '@/components/ui/action-dialog';

type Submission = {
    id: number;
    status: string;
    evidence_text: string | null;
    evidence_url: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
    mission: { id: number; title: string; status: string; type: string; reward_pack_quantity: number; reward_pack_size: number };
    user: { id: number; email: string };
    reviewer: { id: number; email: string } | null;
    sticker_packs: { id: number; status: string; size: number; source: string; created_at: string | null }[];
};

type AuditLog = { id: number; action: string; metadata: Record<string, unknown> | null; created_at: string | null; actor: { email: string } | null };

export default function AdminSocialMissionSubmissionShow({ submission, auditLogs, can }: { submission: Submission; auditLogs: AuditLog[]; can: { approve: boolean; reject: boolean } }) {
    const [approveOpen, setApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);

    const approve = () => {
        setApproveOpen(true);
    };

    const reject = () => {
        setRejectOpen(true);
    };

    return (
        <>
            <Head title={`Submissão #${submission.id}`} />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h1 className="text-xl font-semibold tracking-tight">Submissão #{submission.id}</h1>
                    <div className="flex gap-2">
                        {can.approve ? <button type="button" onClick={approve} className="cursor-pointer rounded-sm border px-3 py-2 text-xs transition-colors hover:bg-accent">Aprovar</button> : null}
                        {can.reject ? <button type="button" onClick={reject} className="cursor-pointer rounded-sm border px-3 py-2 text-xs transition-colors hover:bg-accent">Rejeitar</button> : null}
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Missão:</span> {submission.mission.title}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Participante:</span> {submission.user.email}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Status:</span> {submission.status}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Enviado em:</span> {fmtDateTimeBr(submission.submitted_at)}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Revisado em:</span> {fmtDateTimeBr(submission.reviewed_at)}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Revisor:</span> {submission.reviewer?.email ?? '-'}</div>
                </div>

                <div className="rounded-sm border p-4">
                    <div className="text-xs uppercase text-muted-foreground">Evidência</div>
                    <div className="mt-2 space-y-2 text-sm">
                        <div><span className="text-muted-foreground">Texto:</span> {submission.evidence_text ?? '-'}</div>
                        <div><span className="text-muted-foreground">URL:</span> {submission.evidence_url ? <a className="underline" href={submission.evidence_url} target="_blank" rel="noreferrer">{submission.evidence_url}</a> : '-'}</div>
                    </div>
                </div>

                {submission.sticker_packs.length > 0 ? (
                    <div className="rounded-sm border">
                        <div className="border-b px-4 py-3 text-sm font-medium">Pacotes gerados</div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="px-4 py-2">ID</th>
                                        <th className="px-4 py-2">Status</th>
                                        <th className="px-4 py-2">Source</th>
                                        <th className="px-4 py-2">Size</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submission.sticker_packs.map((pack) => (
                                        <tr key={pack.id} className="border-b">
                                            <td className="px-4 py-2">#{pack.id}</td>
                                            <td className="px-4 py-2">{pack.status}</td>
                                            <td className="px-4 py-2">{pack.source}</td>
                                            <td className="px-4 py-2">{pack.size}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : null}

                <div className="rounded-sm border">
                    <div className="border-b px-4 py-3 text-sm font-medium">Auditoria</div>
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
                open={approveOpen}
                title="Aprovar submissão"
                label="Nota da aprovação (opcional)"
                required={false}
                confirmLabel="Aprovar"
                onConfirm={(note) => {
                    setApproveOpen(false);
                    router.patch(`/admin/social-mission-submissions/${submission.id}/approve`, { note });
                }}
                onCancel={() => setApproveOpen(false)}
            />

            <PromptDialog
                open={rejectOpen}
                title="Rejeitar submissão"
                label="Motivo da rejeição"
                required={true}
                destructive={true}
                confirmLabel="Rejeitar"
                onConfirm={(reason) => {
                    setRejectOpen(false);
                    router.patch(`/admin/social-mission-submissions/${submission.id}/reject`, { rejection_reason: reason });
                }}
                onCancel={() => setRejectOpen(false)}
            />
        </>
    );
}
