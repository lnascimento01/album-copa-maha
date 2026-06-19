import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { fmtDateTimeBr } from '@/lib/date';
import type { FormEvent } from 'react';

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
    team: { id: number; name: string };
    album: { id: number; name: string };
};

type OwnSubmission = {
    id: number;
    status: string;
    evidence_text: string | null;
    evidence_url: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
};

export default function SocialMissionShow({ mission, ownSubmissions }: { mission: Mission; ownSubmissions: OwnSubmission[] }) {
    const page = usePage<{ errors?: Record<string, string> }>();
    const form = useForm({
        evidence_text: '',
        evidence_url: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(`/social-missions/${mission.id}/submissions`);
    };

    return (
        <>
            <Head title={mission.title} />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">{mission.title}</h1>

                <div className="rounded-sm border p-4 text-sm">
                    <div><span className="text-muted-foreground">Tipo:</span> {mission.type}</div>
                    <div><span className="text-muted-foreground">Recompensa:</span> {mission.reward_pack_quantity} pacote(s) de {mission.reward_pack_size}</div>
                    <div><span className="text-muted-foreground">Prazo:</span> {mission.ends_at ? fmtDateTimeBr(mission.ends_at) : 'indefinido'}</div>
                </div>

                <div className="rounded-sm border p-4">
                    <div className="text-xs uppercase text-muted-foreground">Instruções</div>
                    <p className="mt-2 whitespace-pre-wrap text-sm">{mission.instructions ?? mission.description ?? '-'}</p>
                </div>

                <form onSubmit={submit} className="space-y-3 rounded-sm border p-4">
                    <h2 className="text-sm font-medium">Enviar submissão</h2>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">Evidência em texto</label>
                        <textarea value={form.data.evidence_text} onChange={(event) => form.setData('evidence_text', event.target.value)} className="mt-1 min-h-24 w-full rounded-sm border px-2 py-2 text-sm" />
                        {form.errors.evidence_text ? <div className="mt-1 text-xs text-red-700">{form.errors.evidence_text}</div> : null}
                    </div>
                    <div>
                        <label className="text-xs uppercase text-muted-foreground">URL de evidência</label>
                        <input value={form.data.evidence_url} onChange={(event) => form.setData('evidence_url', event.target.value)} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" placeholder="https://..." />
                        {form.errors.evidence_url ? <div className="mt-1 text-xs text-red-700">{form.errors.evidence_url}</div> : null}
                    </div>
                    {page.props.errors?.submission ? <div className="text-xs text-red-700">{page.props.errors.submission}</div> : null}
                    <div className="flex justify-end">
                        <button type="submit" disabled={form.processing} className="rounded-sm border bg-primary px-3 py-2 text-sm text-primary-foreground">Enviar para análise</button>
                    </div>
                </form>

                <div className="rounded-sm border">
                    <div className="border-b px-4 py-3 text-sm font-medium">Suas submissões</div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="px-4 py-2">ID</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">Data</th>
                                    <th className="px-4 py-2">Motivo rejeição</th>
                                    <th className="px-4 py-2">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ownSubmissions.map((submission) => (
                                    <tr key={submission.id} className="border-b">
                                        <td className="px-4 py-2">#{submission.id}</td>
                                        <td className="px-4 py-2">{submission.status}</td>
                                        <td className="px-4 py-2">{fmtDateTimeBr(submission.submitted_at)}</td>
                                        <td className="px-4 py-2">{submission.rejection_reason ?? '-'}</td>
                                        <td className="px-4 py-2"><Link href={`/social-submissions/${submission.id}`} className="text-xs underline">Detalhes</Link></td>
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
