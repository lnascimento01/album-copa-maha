import { Head } from '@inertiajs/react';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricCard } from '@/components/ui/metric-card';
import { PageHeader } from '@/components/ui/page-header';
import { ProgressBar } from '@/components/ui/progress-bar';

type RankingRow = {
    position: number;
    user_id: number;
    user_name: string;
    stickers_unlocked_count: number;
    total_stickers: number;
    album_progress_percent: number;
    packs_opened_count: number;
    checkins_confirmed_count: number;
    reward_codes_redeemed_count: number;
    social_missions_approved_count: number;
    achievements_count: number;
    score: number;
};

type Props = {
    album: { id: number; name: string; slug: string; season: string | null } | null;
    top: RankingRow[];
    me: RankingRow | null;
    formula: string;
};

export default function RankingIndex({ album, top, me, formula }: Props) {
    return (
        <>
            <Head title="Ranking" />
            <div className="space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Ranking da Temporada"
                    subtitle={album ? `${album.name} (${album.season ?? 'temporada'})` : 'Sem álbum ativo'}
                />

                {me ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard label="Sua posição" value={`#${me.position}`} />
                        <MetricCard label="Score" value={me.score} />
                        <MetricCard label="Progresso" value={`${me.album_progress_percent}%`} hint={<ProgressBar value={me.album_progress_percent} />} />
                        <MetricCard label="Conquistas" value={me.achievements_count} />
                    </div>
                ) : null}

                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700">
                    <span className="font-semibold text-zinc-900">Como o score é calculado:</span>{' '}
                    <span className="font-mono">{formula}</span>
                </div>

                <DataTableShell title="Top participantes" subtitle="Ranking motivacional baseado em progresso e participação.">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-200 text-left">
                                <th className="px-4 py-2">Posição</th>
                                <th className="px-4 py-2">Participante</th>
                                <th className="px-4 py-2">Progresso</th>
                                <th className="px-4 py-2">Figurinhas</th>
                                <th className="px-4 py-2">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {top.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8">
                                        <EmptyState title="Nenhum participante elegível no ranking." />
                                    </td>
                                </tr>
                            ) : (
                                top.map((row) => (
                                    <tr key={row.user_id} className="border-b border-zinc-100">
                                        <td className="px-4 py-2 font-semibold text-zinc-900">#{row.position}</td>
                                        <td className="px-4 py-2 text-zinc-800">{row.user_name}</td>
                                        <td className="px-4 py-2 text-zinc-700">{row.album_progress_percent}%</td>
                                        <td className="px-4 py-2 text-zinc-700">{row.stickers_unlocked_count}/{row.total_stickers}</td>
                                        <td className="px-4 py-2 font-semibold text-zinc-900">{row.score}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTableShell>
            </div>
        </>
    );
}
