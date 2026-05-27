import { Head, Link } from '@inertiajs/react';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricCard } from '@/components/ui/metric-card';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { dashboard } from '@/routes';

type AuditActor = {
    id: number;
    name: string;
    email: string;
};

type AuditLog = {
    id: number;
    action: string;
    actor: AuditActor | null;
    target: AuditActor | null;
    created_at: string | null;
};

type DashboardProps = {
    mode: 'admin' | 'participant';
    stats?: {
        pendingUsers?: number;
        approvedUsers?: number;
        activeRewardCodes?: number;
        recentRedemptions?: number;
        pendingSocialSubmissions?: number;
        checkins?: number;
        pendingPacks?: number;
        redeemedCodes?: number;
        missionsPending?: number;
        missionsApproved?: number;
        achievementsUnlocked?: number;
        rankingPosition?: number | null;
        rankingScore?: number | null;
    };
    recentAuditLogs?: AuditLog[];
    approvalStatus?: string;
    permissions?: string[];
    profile?: {
        id: number;
        name: string;
        email: string;
    };
    recentShareCards?: Array<{
        id: number;
        type: string;
        title: string;
        subtitle: string | null;
        created_at: string | null;
    }>;
};

function statusLabel(status: string | undefined): string {
    switch (status) {
        case 'approved':
            return 'Aprovado';
        case 'rejected':
            return 'Rejeitado';
        case 'suspended':
            return 'Suspenso';
        default:
            return 'Pendente';
    }
}

function ParticipantQuickActions() {
    const actions = [
        { title: 'Abrir pacotes', hint: 'Revele novas figurinhas', href: '/packs' },
        { title: 'Ver álbum', hint: 'Acompanhe sua coleção', href: '/album' },
        { title: 'Confirmar presença', hint: 'Use QR/código da atividade', href: '/checkin-code' },
        { title: 'Resgatar código', hint: 'Ganhe pacotes promocionais', href: '/reward-code' },
        { title: 'Missões sociais', hint: 'Envie sua participação', href: '/social-missions' },
        { title: 'Ranking e conquistas', hint: 'Veja seu desempenho', href: '/ranking' },
    ];

    return (
        <section className="rounded-md border border-zinc-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-zinc-900">Próximas ações da temporada</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {actions.map((action) => (
                    <Link key={action.href} href={action.href} className="rounded-md border border-zinc-200 bg-zinc-50 p-3 transition hover:bg-zinc-100">
                        <div className="text-sm font-medium text-zinc-900">{action.title}</div>
                        <div className="mt-1 text-xs text-zinc-600">{action.hint}</div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default function Dashboard(props: DashboardProps) {
    const isAdmin = props.mode === 'admin';

    return (
        <>
            <Head title="Dashboard" />
            <div className="space-y-4 p-4 sm:p-5">
                {isAdmin ? (
                    <>
                        <PageHeader
                            title="Painel Administrativo"
                            subtitle="Operação, controle de acesso e visão rápida da temporada."
                            actions={(
                                <>
                                    <Link className="rounded-sm border border-zinc-300 px-3 py-2 text-xs" href="/admin/users">Usuários</Link>
                                    <Link className="rounded-sm border border-zinc-300 px-3 py-2 text-xs" href="/admin/activities">Atividades</Link>
                                    <Link className="rounded-sm border border-zinc-300 px-3 py-2 text-xs" href="/admin/sticker-packs">Pacotes</Link>
                                    <Link className="rounded-sm border border-zinc-300 px-3 py-2 text-xs" href="/admin/audit-logs">Auditoria</Link>
                                </>
                            )}
                        />

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                            <MetricCard label="Usuários pendentes" value={props.stats?.pendingUsers ?? 0} accent="warning" />
                            <MetricCard label="Usuários aprovados" value={props.stats?.approvedUsers ?? 0} />
                            <MetricCard label="Códigos ativos" value={props.stats?.activeRewardCodes ?? 0} />
                            <MetricCard label="Resgates (7 dias)" value={props.stats?.recentRedemptions ?? 0} />
                            <MetricCard label="Submissões sociais pendentes" value={props.stats?.pendingSocialSubmissions ?? 0} accent="warning" />
                        </div>

                        <section className="rounded-md border border-zinc-200 bg-white">
                            <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold">Últimos eventos de auditoria</div>
                            {(props.recentAuditLogs ?? []).length === 0 ? (
                                <div className="p-4">
                                    <EmptyState title="Nenhum evento recente." description="Assim que ações operacionais ocorrerem, elas aparecerão aqui." />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-zinc-200 text-left">
                                                <th className="px-4 py-2">Ação</th>
                                                <th className="px-4 py-2">Ator</th>
                                                <th className="px-4 py-2">Alvo</th>
                                                <th className="px-4 py-2">Data</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(props.recentAuditLogs ?? []).map((log) => (
                                                <tr key={log.id} className="border-b border-zinc-100">
                                                    <td className="px-4 py-2 font-mono text-xs text-zinc-800">{log.action}</td>
                                                    <td className="px-4 py-2 text-zinc-700">{log.actor?.email ?? '-'}</td>
                                                    <td className="px-4 py-2 text-zinc-700">{log.target?.email ?? '-'}</td>
                                                    <td className="px-4 py-2 text-zinc-600">{log.created_at ?? '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </>
                ) : (
                    <>
                        <PageHeader
                            title="Sua temporada no Álbum da Copa MAHA"
                            subtitle="Sua jornada começa pela presença, passa pelos pacotes e vira coleção."
                        />

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <MetricCard
                                label="Status do cadastro"
                                value={<StatusBadge value={props.approvalStatus ?? 'pending'} label={statusLabel(props.approvalStatus)} />}
                                hint={props.profile?.email}
                            />
                            <MetricCard
                                label="Pacotes pendentes"
                                value={props.stats?.pendingPacks ?? 0}
                                hint={<Link className="underline" href="/packs">Abrir pacotes</Link>}
                                accent={(props.stats?.pendingPacks ?? 0) > 0 ? 'warning' : 'default'}
                            />
                            <MetricCard
                                label="Posição no ranking"
                                value={props.stats?.rankingPosition ? `#${props.stats?.rankingPosition}` : '-'}
                                hint={`Score: ${props.stats?.rankingScore ?? 0}`}
                            />
                            <MetricCard
                                label="Conquistas desbloqueadas"
                                value={props.stats?.achievementsUnlocked ?? 0}
                                hint={<Link className="underline" href="/achievements">Ver conquistas</Link>}
                                accent="success"
                            />
                        </div>

                        <ParticipantQuickActions />

                        <section className="rounded-md border border-zinc-200 bg-white p-4">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-sm font-semibold text-zinc-900">Resumo de participação</h2>
                                <Link className="text-xs underline" href="/checkins">Histórico de check-ins</Link>
                            </div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                <MetricCard label="Check-ins" value={props.stats?.checkins ?? 0} />
                                <MetricCard label="Códigos resgatados" value={props.stats?.redeemedCodes ?? 0} />
                                <MetricCard
                                    label="Missões sociais"
                                    value={`${props.stats?.missionsApproved ?? 0} aprov.`}
                                    hint={`Pendentes: ${props.stats?.missionsPending ?? 0}`}
                                />
                            </div>
                        </section>

                        <section className="rounded-md border border-zinc-200 bg-white p-4">
                            <h2 className="text-sm font-semibold text-zinc-900">Permissões efetivas (somente leitura)</h2>
                            {(props.permissions ?? []).length === 0 ? (
                                <div className="mt-2 text-sm text-zinc-600">Nenhuma permissão administrativa atribuída.</div>
                            ) : (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {(props.permissions ?? []).map((permission) => (
                                        <code key={permission} className="rounded-sm border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] text-zinc-700">
                                            {permission}
                                        </code>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="rounded-md border border-zinc-200 bg-white p-4">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-sm font-semibold text-zinc-900">Cards recentes</h2>
                                <Link className="text-xs underline" href="/share-cards">Ver todos</Link>
                            </div>
                            {(props.recentShareCards ?? []).length === 0 ? (
                                <div className="mt-3">
                                    <EmptyState title="Nenhum card gerado ainda." description="Gere cards de progresso, pacote ou conquista para compartilhar com o time." />
                                </div>
                            ) : (
                                <ul className="mt-3 space-y-2">
                                    {(props.recentShareCards ?? []).map((card) => (
                                        <li key={card.id} className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900">{card.title}</p>
                                                <p className="text-xs uppercase tracking-wide text-zinc-500">{card.type}</p>
                                            </div>
                                            <Link href={`/share-cards/${card.id}`} className="rounded-sm border border-zinc-300 px-2 py-1 text-xs">
                                                Abrir
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
