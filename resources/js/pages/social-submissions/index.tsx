import { Head, Link } from '@inertiajs/react';
import { PaginationLinks } from '@/components/ui/pagination-links';
import { fmtDateTimeBr } from '@/lib/date';

type Submission = {
    id: number;
    status: string;
    evidence_text: string | null;
    evidence_url: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
    mission: { id: number; title: string; slug: string; type: string };
    sticker_packs_count: number;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

export default function SocialSubmissionsIndex({ submissions }: { submissions: { data: Submission[]; links: PaginationLink[] } }) {
    return (
        <>
            <Head title="Minhas Submissões" />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Minhas Submissões Sociais</h1>

                <div className="overflow-x-auto rounded-sm border">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="px-4 py-2">Missão</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Data</th>
                                <th className="px-4 py-2">Pacotes</th>
                                <th className="px-4 py-2">Motivo rejeição</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.data.map((submission) => (
                                <tr key={submission.id} className="border-b">
                                    <td className="px-4 py-2">{submission.mission.title}</td>
                                    <td className="px-4 py-2">{submission.status}</td>
                                    <td className="px-4 py-2">{fmtDateTimeBr(submission.submitted_at)}</td>
                                    <td className="px-4 py-2">{submission.sticker_packs_count}</td>
                                    <td className="px-4 py-2">{submission.rejection_reason ?? '-'}</td>
                                    <td className="px-4 py-2"><Link href={`/social-submissions/${submission.id}`} className="text-xs underline">Detalhes</Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <PaginationLinks links={submissions.links} />
            </div>
        </>
    );
}
