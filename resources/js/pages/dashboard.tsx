import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
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

type QueueTab = 'all' | 'users' | 'submissions' | 'codes' | 'audit';
type QueueKind = Exclude<QueueTab, 'all'>;

type ActionQueueItem = {
    id: string;
    kind: QueueKind;
    title: string;
    description: string;
    cta: string;
    href: string;
    tone?: 'default' | 'warning' | 'success';
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
        { title: 'Ver álbum', hint: 'Folhear coleção da temporada', href: '/album' },
        { title: 'Confirmar presença', hint: 'Use QR/código da atividade', href: '/checkin-code' },
        { title: 'Resgatar código', hint: 'Ganhe pacotes promocionais', href: '/reward-code' },
        { title: 'Missões sociais', hint: 'Envie sua participação', href: '/social-missions' },
        { title: 'Ranking e conquistas', hint: 'Veja seu desempenho', href: '/ranking' },
    ];

    return (
        <section className="album-paper p-4">
            <h2 className="text-sm font-semibold text-foreground">Rota do colecionador</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {actions.map((action) => (
                    <Link key={action.href} href={action.href} className="group mission-ticket transition hover:-translate-y-0.5 motion-reduce:transform-none">
                        <div className="text-sm font-semibold text-foreground">{action.title}</div>
                        <div className="mt-1 text-xs text-dim">{action.hint}</div>
                        <div className="mt-2 text-[10px] font-semibold tracking-[0.12em] text-primary uppercase opacity-70 group-hover:opacity-100">
                            Acessar etapa
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

function humanizeAuditAction(action: string): string {
    const normalized = action.trim().toLowerCase();
    const dictionary: Record<string, string> = {
        'user.login': 'Login realizado',
        'user.approved': 'Usuário aprovado',
        'code.redeemed': 'Código resgatado',
        'package.opened': 'Pacote aberto',
        'submission.created': 'Submissão enviada',
        'submission.approved': 'Submissão aprovada',
        'submission.rejected': 'Submissão reprovada',
    };

    return dictionary[normalized] ?? action;
}

export default function Dashboard(props: DashboardProps) {
    const isAdmin = props.mode === 'admin';
    const [queueTab, setQueueTab] = useState<QueueTab>('all');

    const queueItems = useMemo<ActionQueueItem[]>(() => {
        const pendingUsers = props.stats?.pendingUsers ?? 0;
        const pendingSubmissions = props.stats?.pendingSocialSubmissions ?? 0;
        const recentRedemptions = props.stats?.recentRedemptions ?? 0;
        const hasAudit = (props.recentAuditLogs ?? []).length > 0;
        const items: ActionQueueItem[] = [];

        if (pendingUsers > 0) {
            items.push({
                id: 'pending-users',
                kind: 'users',
                title: `${pendingUsers} usuário(s) aguardando aprovação`,
                description: 'Aprove agora para liberar acesso ao fluxo da temporada.',
                cta: 'Aprovar',
                href: '/admin/users',
                tone: 'warning',
            });
        }

        if (pendingSubmissions > 0) {
            items.push({
                id: 'pending-submissions',
                kind: 'submissions',
                title: `${pendingSubmissions} submissão(ões) para revisar`,
                description: 'Priorize a revisão para manter o engajamento em dia.',
                cta: 'Revisar agora',
                href: '/admin/social-mission-submissions',
                tone: 'warning',
            });
        }

        if (recentRedemptions > 0) {
            items.push({
                id: 'recent-redemptions',
                kind: 'codes',
                title: `${recentRedemptions} resgate(s) nos últimos 7 dias`,
                description: 'Confira os códigos ativos e o fluxo de campanhas.',
                cta: 'Ver detalhes',
                href: '/admin/reward-codes',
                tone: 'default',
            });
        }

        if (hasAudit) {
            items.push({
                id: 'recent-audit',
                kind: 'audit',
                title: 'Eventos recentes na auditoria',
                description: 'Valide atividades críticas e mantenha rastreabilidade.',
                cta: 'Ver auditoria',
                href: '/admin/audit-logs',
                tone: 'default',
            });
        }

        return items;
    }, [props.recentAuditLogs, props.stats?.pendingSocialSubmissions, props.stats?.pendingUsers, props.stats?.recentRedemptions]);

    const filteredQueueItems = queueTab === 'all' ? queueItems : queueItems.filter((item) => item.kind === queueTab);
    const approvedUsers = props.stats?.approvedUsers ?? 0;
    const activeRewardCodes = props.stats?.activeRewardCodes ?? 0;
    const recentRedemptions = props.stats?.recentRedemptions ?? 0;
    const pendingUsers = props.stats?.pendingUsers ?? 0;
    const pendingSubmissions = props.stats?.pendingSocialSubmissions ?? 0;
    const approvalProgress = approvedUsers + pendingUsers > 0
        ? Math.round((approvedUsers / (approvedUsers + pendingUsers)) * 100)
        : 0;

    return (
        <>
            <Head title="Dashboard" />
            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                {isAdmin ? (
                    <>
                        <PageHeader
                            title="Centro de Operação da Temporada"
                            subtitle="Acompanhe aprovações, campanhas e atividade operacional do Álbum da Copa AAPH."
                            actions={(
                                <>
                                    <Link className="rounded-sm border border-border bg-card px-3 py-2 text-xs font-semibold" href="/admin/users">Usuários</Link>
                                    <Link className="rounded-sm border border-border bg-card px-3 py-2 text-xs font-semibold" href="/admin/activities">Atividades</Link>
                                    <Link className="rounded-sm border border-border bg-card px-3 py-2 text-xs font-semibold" href="/admin/sticker-packs">Pacotes</Link>
                                    <Link className="rounded-sm border border-border bg-card px-3 py-2 text-xs font-semibold" href="/admin/audit-logs">Auditoria</Link>
                                </>
                            )}
                        />

                        <section className="admin-strip">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-semibold tracking-[0.15em] text-dim uppercase">Centro operacional</p>
                                    <p className="mt-1 text-sm text-foreground">Monitore aprovações, campanhas e atividade da coleção em tempo real.</p>
                                </div>
                                <span className="brand-pill">Administração AAPH</span>
                            </div>
                        </section>

                        <section className="album-paper p-4">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-sm font-semibold text-foreground">Alertas operacionais</h2>
                                <span className="text-xs text-dim">Atualização em tempo real</span>
                            </div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                <MetricCard
                                    label="Aguardando aprovação"
                                    value={pendingUsers}
                                    accent={pendingUsers > 0 ? 'warning' : 'default'}
                                    hint={pendingUsers > 0 ? 'Há usuários esperando revisão.' : 'Tudo em dia: nenhum usuário aguardando aprovação.'}
                                />
                                <MetricCard
                                    label="Submissões para revisar"
                                    value={pendingSubmissions}
                                    accent={pendingSubmissions > 0 ? 'warning' : 'default'}
                                    hint={pendingSubmissions > 0 ? 'Pendências de missão aguardando análise.' : 'Tudo em dia: nenhuma submissão pendente.'}
                                />
                                <MetricCard
                                    label="Revisão de atividade"
                                    value={(props.recentAuditLogs ?? []).length}
                                    hint={(props.recentAuditLogs ?? []).length > 0 ? 'Eventos recentes disponíveis para auditoria.' : 'Nenhum evento crítico recente.'}
                                />
                            </div>
                        </section>

                        <section className="album-paper p-4">
                            <h2 className="text-sm font-semibold text-foreground">Saúde operacional</h2>
                            {approvedUsers + activeRewardCodes + recentRedemptions === 0 ? (
                                <div className="mt-3">
                                    <EmptyState
                                        title="Sem indicadores agregados nesta etapa."
                                        description="Acompanhe o andamento de adesão e evolução da coleção quando esses indicadores estiverem disponíveis."
                                    />
                                </div>
                            ) : (
                                <div className="mt-3 space-y-3">
                                    <div>
                                        <div className="mb-1 flex items-center justify-between text-xs">
                                            <span className="text-dim">Usuários aprovados</span>
                                            <span className="font-semibold text-[color:var(--secondary-700)]">{approvalProgress}%</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-[color:var(--secondary-100)]">
                                            <div className="h-full rounded-full bg-[color:var(--secondary-500)]" style={{ width: `${approvalProgress}%` }} />
                                        </div>
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-3">
                                        <div className="rounded-md border border-[color:var(--secondary-200)] bg-[color:var(--secondary-50)] p-2 text-xs text-[color:var(--secondary-900)]">
                                            Códigos ativos: <strong>{activeRewardCodes}</strong>
                                        </div>
                                        <div className="rounded-md border border-[color:var(--secondary-200)] bg-[color:var(--secondary-50)] p-2 text-xs text-[color:var(--secondary-900)]">
                                            Resgates 7 dias: <strong>{recentRedemptions}</strong>
                                        </div>
                                        <div className="rounded-md border border-[color:var(--secondary-200)] bg-[color:var(--secondary-50)] p-2 text-xs text-[color:var(--secondary-900)]">
                                            Pendências: <strong>{pendingUsers + pendingSubmissions}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <MetricCard label="Usuários aprovados" value={approvedUsers} hint="Base ativa da temporada" />
                            <MetricCard label="Códigos ativos" value={activeRewardCodes} hint="Campanhas disponíveis para resgate" />
                            <MetricCard label="Resgates (7 dias)" value={recentRedemptions} hint="Engajamento recente de campanha" />
                            <MetricCard label="Eventos auditados" value={(props.recentAuditLogs ?? []).length} hint="Rastreabilidade operacional" />
                        </div>

                        <section className="album-paper p-4">
                            <h2 className="text-sm font-semibold text-foreground">Fila de ações pendentes</h2>
                            <p className="mt-1 text-xs text-dim">Priorize aprovações e revisões para manter o fluxo da temporada.</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {[
                                    { id: 'all', label: 'Todos' },
                                    { id: 'users', label: 'Usuários' },
                                    { id: 'submissions', label: 'Submissões' },
                                    { id: 'codes', label: 'Códigos' },
                                    { id: 'audit', label: 'Auditoria' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setQueueTab(tab.id as QueueTab)}
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                            queueTab === tab.id
                                                ? 'border-[color:var(--primary-500)] bg-[color:var(--primary-50)] text-[color:var(--primary-600)]'
                                                : 'border-border bg-card text-dim hover:border-[color:var(--primary-200)] hover:text-foreground'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-3 space-y-2">
                                {filteredQueueItems.length === 0 ? (
                                    <EmptyState
                                        title="Nenhuma fila operacional disponível nesta visão."
                                        description="Quando houver aprovações, submissões ou códigos exigindo revisão, eles aparecerão aqui."
                                        action={(
                                            <div className="flex flex-wrap gap-2">
                                                <Link className="app-link-chip" href="/admin/users">Ver usuários</Link>
                                                <Link className="app-link-chip" href="/admin/audit-logs">Ver auditoria</Link>
                                            </div>
                                        )}
                                    />
                                ) : (
                                    filteredQueueItems.map((item) => (
                                        <article key={item.id} className="rounded-md border border-border bg-card p-3 shadow-[var(--shadow-sm)]">
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                                                    <p className="mt-1 text-xs text-dim">{item.description}</p>
                                                </div>
                                                <Button asChild size="sm" variant={item.tone === 'warning' ? 'default' : 'secondary'}>
                                                    <Link href={item.href}>{item.cta}</Link>
                                                </Button>
                                            </div>
                                        </article>
                                    ))
                                )}
                            </div>
                        </section>

                        <section className="album-paper overflow-hidden">
                            <div className="border-b border-border px-4 py-3 text-sm font-semibold">Atividade recente</div>
                            {(props.recentAuditLogs ?? []).length === 0 ? (
                                <div className="p-4">
                                    <EmptyState title="Nenhum evento recente." description="Assim que ações operacionais ocorrerem, elas aparecerão aqui." />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border text-left">
                                                <th className="px-4 py-2">Ação</th>
                                                <th className="px-4 py-2">Ator</th>
                                                <th className="px-4 py-2">Alvo</th>
                                                <th className="px-4 py-2">Data</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(props.recentAuditLogs ?? []).map((log) => (
                                                <tr key={log.id} className="admin-table-row">
                                                    <td className="px-4 py-2">
                                                        <p className="text-xs font-semibold text-foreground">{humanizeAuditAction(log.action)}</p>
                                                        <p className="mt-0.5 font-mono text-[10px] text-dim">{log.action}</p>
                                                    </td>
                                                    <td className="px-4 py-2 text-dim">{log.actor?.email ?? '-'}</td>
                                                    <td className="px-4 py-2 text-dim">{log.target?.email ?? '-'}</td>
                                                    <td className="px-4 py-2 text-dim">{log.created_at ?? '-'}</td>
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
                            title="Sua temporada no Álbum da Copa AAPH"
                            subtitle="Coleção, presença e evolução no mesmo lugar."
                        />

                        <section className="season-hero">
                            <div className="relative z-10">
                                <p className="season-kicker">Jornada da Copa AAPH</p>
                                <h2 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">Cada presença vira coleção</h2>
                                <p className="mt-2 max-w-2xl text-sm text-dim">
                                    Confirme presença, abra pacotes e acompanhe seu avanço nas páginas do álbum oficial da temporada.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Link href="/packs" className="rounded-sm border border-[color:var(--secondary-700)] bg-[color:var(--secondary-700)] px-3 py-2 text-xs font-semibold tracking-wide text-white uppercase">
                                        Abrir pacotes
                                    </Link>
                                    <Link href="/album" className="rounded-sm border border-[color:var(--primary-200)] bg-[color:var(--primary-50)] px-3 py-2 text-xs font-semibold tracking-wide text-[color:var(--primary-600)] uppercase">
                                        Folhear álbum
                                    </Link>
                                </div>
                            </div>
                        </section>

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

                        <section className="album-paper p-4">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-sm font-semibold text-foreground">Resumo de participação</h2>
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

                        <section className="campaign-panel">
                            <h2 className="text-sm font-semibold text-foreground">Acesso atual (somente leitura)</h2>
                            {(props.permissions ?? []).length === 0 ? (
                                <div className="mt-2 text-sm text-dim">Nenhuma permissão administrativa atribuída.</div>
                            ) : (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {(props.permissions ?? []).map((permission) => (
                                        <code key={permission} className="rounded-sm border border-border bg-muted/65 px-2 py-1 text-[11px] text-dim">
                                            {permission}
                                        </code>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="album-paper p-4">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-sm font-semibold text-foreground">Cards recentes</h2>
                                <Link className="text-xs underline" href="/share-cards">Ver todos</Link>
                            </div>
                            {(props.recentShareCards ?? []).length === 0 ? (
                                <div className="mt-3">
                                    <EmptyState title="Nenhum card gerado ainda." description="Gere cards de progresso, pacote ou conquista para compartilhar com o time." />
                                </div>
                            ) : (
                                <ul className="mt-3 space-y-2">
                                    {(props.recentShareCards ?? []).map((card) => (
                                        <li key={card.id} className="flex items-center justify-between gap-3 rounded-md border border-[color:var(--sticker-frame)] bg-[color:var(--sticker-surface)] px-3 py-2">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{card.title}</p>
                                                <p className="text-xs uppercase tracking-wide text-dim">{card.type}</p>
                                            </div>
                                            <Link href={`/share-cards/${card.id}`} className="rounded-sm border border-border bg-card px-2 py-1 text-xs">
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
