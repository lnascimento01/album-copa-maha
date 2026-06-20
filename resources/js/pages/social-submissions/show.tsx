import { Head, Link } from '@inertiajs/react';
import { fmtDateTimeBr } from '@/lib/date';

type Submission = {
    id: number;
    status: string;
    evidence_text: string | null;
    evidence_url: string | null;
    evidence_image_urls: string[];
    submitted_at: string | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
    mission: { id: number; title: string; type: string; status: string; reward_pack_quantity: number; reward_pack_size: number };
    reviewer: { id: number; email: string } | null;
    sticker_packs: { id: number; status: string; source: string; size: number; created_at: string | null }[];
};

export default function SocialSubmissionShow({ submission }: { submission: Submission }) {
    return (
        <>
            <Head title={`Submissão #${submission.id}`} />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Submissão #{submission.id}</h1>

                <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Missão:</span> {submission.mission.title}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Status:</span> {submission.status}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Revisor:</span> {submission.reviewer?.email ?? '-'}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Enviado:</span> {fmtDateTimeBr(submission.submitted_at)}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Revisado:</span> {fmtDateTimeBr(submission.reviewed_at)}</div>
                    <div className="rounded-sm border p-4 text-sm"><span className="text-muted-foreground">Motivo rejeição:</span> {submission.rejection_reason ?? '-'}</div>
                </div>

                <div className="rounded-sm border p-4">
                    <div className="text-xs uppercase text-muted-foreground">Evidência</div>
                    <div className="mt-2 space-y-2 text-sm">
                        <div><span className="text-muted-foreground">Texto:</span> {submission.evidence_text ?? '-'}</div>
                        <div><span className="text-muted-foreground">URL:</span> {submission.evidence_url ? <a href={submission.evidence_url} className="underline" target="_blank" rel="noreferrer">{submission.evidence_url}</a> : '-'}</div>
                        {submission.evidence_image_urls.length > 0 ? (
                            <div>
                                <span className="text-muted-foreground">Imagens:</span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {submission.evidence_image_urls.map((url, index) => (
                                        <a key={index} href={url} target="_blank" rel="noreferrer">
                                            <img src={url} alt={`evidência ${index + 1}`} className="h-28 w-28 rounded-sm border object-cover" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ) : null}
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
                                        <th className="px-4 py-2">Origem</th>
                                        <th className="px-4 py-2">Tamanho</th>
                                        <th className="px-4 py-2">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submission.sticker_packs.map((pack) => (
                                        <tr key={pack.id} className="border-b">
                                            <td className="px-4 py-2">#{pack.id}</td>
                                            <td className="px-4 py-2">{pack.status}</td>
                                            <td className="px-4 py-2">{pack.source}</td>
                                            <td className="px-4 py-2">{pack.size}</td>
                                            <td className="px-4 py-2"><Link href={`/packs/${pack.id}`} className="text-xs underline">Abrir detalhe</Link></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : null}
            </div>
        </>
    );
}
