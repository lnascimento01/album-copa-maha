import { Head, useForm } from '@inertiajs/react';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricCard } from '@/components/ui/metric-card';
import { PageHeader } from '@/components/ui/page-header';
import { ProgressBar } from '@/components/ui/progress-bar';
import { StatusBadge } from '@/components/ui/status-badge';

type Achievement = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: string;
    threshold: number | null;
    icon: string | null;
    color: string | null;
    is_unlocked: boolean;
    unlocked_at: string | null;
    progress_value: number;
    progress_percent: number;
};

type Props = {
    album: { id: number; name: string; slug: string; season: string | null } | null;
    metrics: Record<string, number>;
    unlocked: Achievement[];
    locked: Achievement[];
    newlyUnlockedCount: number;
};

export default function AchievementsIndex({ album, metrics, unlocked, locked, newlyUnlockedCount }: Props) {
    const cardForm = useForm({
        type: 'achievement_unlocked',
        achievement_id: '',
    });

    const generateCard = (achievementId: number) => {
        cardForm.transform(() => ({
            type: 'achievement_unlocked',
            achievement_id: achievementId,
        }));

        cardForm.post('/share-cards');
    };

    return (
        <>
            <Head title="Conquistas" />
            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Minhas Conquistas"
                    subtitle={album ? `${album.name} (${album.season ?? 'temporada'})` : 'Sem álbum ativo'}
                />

                {newlyUnlockedCount > 0 ? (
                    <div className="rounded-md border border-[color:var(--brand-secondary)]/45 bg-[color:var(--brand-secondary)]/12 p-3 text-sm text-foreground">
                        Você desbloqueou {newlyUnlockedCount} nova(s) conquista(s) recentemente.
                    </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard label="Desbloqueadas" value={unlocked.length} accent="success" />
                    <MetricCard label="Bloqueadas" value={locked.length} />
                    <MetricCard label="Progresso do álbum" value={`${metrics.album_progress_percent ?? 0}%`} hint={<ProgressBar value={metrics.album_progress_percent ?? 0} />} />
                    <MetricCard label="Pacotes abertos" value={metrics.packs_opened_count ?? 0} />
                </div>

                <section className="album-paper p-4">
                    <h2 className="text-sm font-semibold text-foreground">Mural de conquistas desbloqueadas</h2>
                    {unlocked.length === 0 ? (
                        <div className="mt-3">
                            <EmptyState title="Nenhuma conquista desbloqueada ainda." />
                        </div>
                    ) : (
                        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {unlocked.map((achievement) => (
                                <article key={achievement.id} className="rounded-md border border-[color:var(--brand-secondary)]/45 bg-[color:color-mix(in_srgb,var(--brand-secondary)_12%,var(--card))] p-3">
                                    <StatusBadge value="approved" label="Desbloqueada" />
                                    <h3 className="mt-2 text-sm font-semibold text-foreground">{achievement.name}</h3>
                                    <p className="text-xs text-dim">{achievement.type} {achievement.threshold ? `• alvo ${achievement.threshold}` : ''}</p>
                                    <p className="mt-2 text-xs text-dim">{achievement.description ?? 'Conquista da temporada.'}</p>
                                    <div className="mt-3 flex justify-end">
                                        <button type="button" onClick={() => generateCard(achievement.id)} className="app-link-chip">
                                            Gerar card
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="album-paper p-4">
                    <h2 className="text-sm font-semibold text-foreground">Conquistas em progresso</h2>
                    {locked.length === 0 ? (
                        <div className="mt-3">
                            <EmptyState title="Nenhuma conquista pendente." />
                        </div>
                    ) : (
                        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {locked.map((achievement) => (
                                <article key={achievement.id} className="rounded-md border border-border bg-muted/60 p-3 opacity-80">
                                    <StatusBadge value="pending" label="Em progresso" />
                                    <h3 className="mt-2 text-sm font-semibold text-foreground">{achievement.name}</h3>
                                    <p className="text-xs text-dim">{achievement.type} {achievement.threshold ? `• alvo ${achievement.threshold}` : ''}</p>
                                    <div className="mt-2">
                                        <ProgressBar value={achievement.progress_percent} label={`${achievement.progress_percent}% • atual ${achievement.progress_value}`} />
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
