import { Head } from '@inertiajs/react';
import { Award, CheckCircle2, Crown, Medal, Package, QrCode, Sticker, Target, Trophy } from 'lucide-react';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricCard } from '@/components/ui/metric-card';
import { PageHeader } from '@/components/ui/page-header';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ResponsiveDataList } from '@/components/ui/responsive-data-list';

const SCORE_FACTORS = [
    { label: 'Figurinha desbloqueada', Icon: Sticker,      pts: 10, color: '#fbbf24' },
    { label: 'Pacote aberto',          Icon: Package,      pts: 3,  color: '#a78bfa' },
    { label: 'Check-in confirmado',    Icon: CheckCircle2, pts: 5,  color: '#34d399' },
    { label: 'Código resgatado',       Icon: QrCode,       pts: 2,  color: '#60a5fa' },
    { label: 'Missão aprovada',        Icon: Target,       pts: 5,  color: '#f97316' },
    { label: 'Conquista',              Icon: Award,        pts: 8,  color: '#fcd34d' },
] as const;

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

function podiumIcon(position: number) {
    if (position === 1) {
        return <Crown className="size-4 text-[color:var(--brand-secondary)]" />;
    }

    if (position === 2) {
        return <Medal className="size-4 text-primary" />;
    }

    if (position === 3) {
        return <Trophy className="size-4 text-amber-500" />;
    }

    return null;
}

export default function RankingIndex({ album, top, me, formula }: Props) {
    return (
        <>
            <Head title="Ranking" />
            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Ranking da Temporada"
                    subtitle={album ? `${album.name} (${album.season ?? 'temporada'})` : 'Sem álbum ativo'}
                />

                <section className="season-hero">
                    <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="season-kicker">Competição AAPH</p>
                            <h2 className="mt-2 text-2xl font-semibold text-foreground">Disputa por progresso de coleção</h2>
                            <p className="mt-1 text-sm text-dim">
                                O ranking considera presença, participação e figurinhas desbloqueadas no álbum.
                            </p>
                            {top.length === 0 ? (
                                <p className="mt-2 text-xs font-medium text-dim">Ainda não há pontuações registradas para esta visão.</p>
                            ) : null}
                        </div>
                        <div className="rounded-md border border-border bg-card px-3 py-2 text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">Top da rodada</p>
                            <p className="text-lg font-semibold text-foreground">{top.length}</p>
                        </div>
                    </div>
                </section>

                {me ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard label="Sua posição" value={`#${me.position}`} />
                        <MetricCard label="Score" value={me.score} />
                        <MetricCard label="Progresso" value={`${me.album_progress_percent}%`} hint={<ProgressBar value={me.album_progress_percent} />} />
                        <MetricCard label="Conquistas" value={me.achievements_count} />
                    </div>
                ) : null}

                <section className="album-paper p-4">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Como o score é calculado</p>
                    <div className="flex flex-wrap gap-2">
                        {SCORE_FACTORS.map(({ label, Icon, pts, color }) => (
                            <div key={label} className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5">
                                <Icon className="size-3.5 shrink-0" style={{ color }} />
                                <span className="text-[11px] text-muted-foreground">{label}</span>
                                <span className="text-[11px] font-bold" style={{ color }}>×{pts}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {top.length > 0 ? (
                    <section className="grid gap-3 md:grid-cols-3">
                        {top.slice(0, 3).map((row) => (
                            <article key={row.user_id} className="podium-card" data-rank={row.position}>
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-foreground">#{row.position} {row.user_name}</p>
                                    {podiumIcon(row.position)}
                                </div>
                                <p className="mt-2 text-[clamp(1.65rem,2.8vw,2.1rem)] font-semibold leading-none text-foreground">{row.score}</p>
                                <p className="text-xs text-dim">{row.stickers_unlocked_count}/{row.total_stickers} figurinhas</p>
                                <div className="mt-2">
                                    <ProgressBar value={row.album_progress_percent} />
                                </div>
                            </article>
                        ))}
                    </section>
                ) : null}

                <DataTableShell title="Top participantes" subtitle="Ranking motivacional por progresso, presença e participação no álbum.">
                    <ResponsiveDataList
                        items={top}
                        getKey={(row) => row.user_id}
                        empty={<EmptyState title="Nenhum participante elegível no ranking." />}
                        renderItem={(row) => (
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">#{row.position} {row.user_name}</p>
                                        <p className="mt-1 text-xs text-dim">{row.stickers_unlocked_count}/{row.total_stickers} figurinhas</p>
                                    </div>
                                    <p className="text-base font-semibold text-foreground">{row.score}</p>
                                </div>
                                <ProgressBar value={row.album_progress_percent} label={`${row.album_progress_percent}%`} />
                            </div>
                        )}
                    />
                    <table className="hidden min-w-full text-sm md:table">
                        <thead>
                            <tr className="border-b border-border text-left">
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
                                    <tr key={row.user_id} className="admin-table-row">
                                        <td className="px-4 py-2 font-semibold text-foreground">#{row.position}</td>
                                        <td className="px-4 py-2 text-foreground">{row.user_name}</td>
                                        <td className="px-4 py-2 text-dim">{row.album_progress_percent}%</td>
                                        <td className="px-4 py-2 text-dim">{row.stickers_unlocked_count}/{row.total_stickers}</td>
                                        <td className="px-4 py-2 font-semibold text-foreground">{row.score}</td>
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
