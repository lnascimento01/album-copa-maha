import { Head, router } from '@inertiajs/react';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricCard } from '@/components/ui/metric-card';
import { PageHeader } from '@/components/ui/page-header';

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
    rows: RankingRow[];
    filters: { include_admins: boolean };
    formula: string;
};

export default function AdminRankingsIndex({ album, rows, filters, formula }: Props) {
    return (
        <>
            <Head title="Ranking (Admin)" />

            <div className="space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Ranking Geral"
                    subtitle={album ? `${album.name} (${album.season ?? 'temporada'})` : 'Sem álbum ativo'}
                    actions={(
                        <label className="flex items-center gap-2 rounded-sm border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-700">
                            <input
                                type="checkbox"
                                checked={filters.include_admins}
                                onChange={(event) => router.get('/admin/rankings', { include_admins: event.target.checked ? 1 : 0 }, { preserveState: true, replace: true })}
                            />
                            Incluir admins
                        </label>
                    )}
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard label="Participantes no ranking" value={rows.length} />
                    <MetricCard label="Líder atual" value={rows[0]?.user_name ?? '-'} />
                    <MetricCard label="Maior score" value={rows[0]?.score ?? 0} />
                    <MetricCard label="Álbum ativo" value={album?.name ?? '-'} />
                </div>

                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700">
                    <span className="font-semibold text-zinc-900">Fórmula:</span> <span className="font-mono">{formula}</span>
                </div>

                <DataTableShell title="Ranking detalhado" subtitle="Score calculado por participação e progresso de coleção.">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-200 text-left">
                                <th className="px-4 py-2">Posição</th>
                                <th className="px-4 py-2">Participante</th>
                                <th className="px-4 py-2">Figurinhas</th>
                                <th className="px-4 py-2">Progresso</th>
                                <th className="px-4 py-2">Pacotes</th>
                                <th className="px-4 py-2">Check-ins</th>
                                <th className="px-4 py-2">Códigos</th>
                                <th className="px-4 py-2">Missões</th>
                                <th className="px-4 py-2">Conquistas</th>
                                <th className="px-4 py-2">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-8">
                                        <EmptyState title="Nenhum dado de ranking disponível." />
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row) => (
                                    <tr key={row.user_id} className="border-b border-zinc-100">
                                        <td className="px-4 py-2 font-semibold text-zinc-900">#{row.position}</td>
                                        <td className="px-4 py-2 text-zinc-800">{row.user_name}</td>
                                        <td className="px-4 py-2 text-zinc-700">{row.stickers_unlocked_count}/{row.total_stickers}</td>
                                        <td className="px-4 py-2 text-zinc-700">{row.album_progress_percent}%</td>
                                        <td className="px-4 py-2 text-zinc-700">{row.packs_opened_count}</td>
                                        <td className="px-4 py-2 text-zinc-700">{row.checkins_confirmed_count}</td>
                                        <td className="px-4 py-2 text-zinc-700">{row.reward_codes_redeemed_count}</td>
                                        <td className="px-4 py-2 text-zinc-700">{row.social_missions_approved_count}</td>
                                        <td className="px-4 py-2 text-zinc-700">{row.achievements_count}</td>
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
