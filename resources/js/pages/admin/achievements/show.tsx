import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type UserRef = { id: number; name: string; email: string };

type Props = {
    achievement: {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        type: string;
        threshold: number | null;
        icon: string | null;
        color: string | null;
        is_active: boolean;
        sort_order: number;
        metadata: Record<string, unknown> | null;
        team: { id: number; name: string } | null;
        album: { id: number; name: string; slug: string } | null;
        users: Array<{
            id: number;
            source: string | null;
            unlocked_at: string | null;
            user: UserRef;
            album: { id: number; name: string } | null;
        }>;
    };
    users: UserRef[];
    auditLogs: Array<{
        id: number;
        action: string;
        metadata: Record<string, unknown> | null;
        created_at: string | null;
        actor: UserRef | null;
        target: UserRef | null;
    }>;
    can: {
        update: boolean;
        grant: boolean;
    };
};

export default function AdminAchievementsShow({ achievement, users, auditLogs, can }: Props) {
    const grantForm = useForm({ user_id: '', note: '' });

    const submitGrant = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        grantForm.post(`/admin/achievements/${achievement.id}/grant`);
    };

    return (
        <>
            <Head title={`Conquista #${achievement.id}`} />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">{achievement.name}</h1>
                        <div className="font-mono text-xs text-muted-foreground">{achievement.slug}</div>
                    </div>
                    {can.update ? <Link href={`/admin/achievements/${achievement.id}/edit`} className="rounded-sm border px-3 py-2 text-xs">Editar</Link> : null}
                </div>

                <div className="grid gap-3 rounded-sm border p-4 md:grid-cols-3 text-sm">
                    <div><span className="text-xs uppercase text-muted-foreground">Tipo</span><div>{achievement.type}</div></div>
                    <div><span className="text-xs uppercase text-muted-foreground">Threshold</span><div>{achievement.threshold ?? '-'}</div></div>
                    <div><span className="text-xs uppercase text-muted-foreground">Ativa</span><div>{achievement.is_active ? 'Sim' : 'Não'}</div></div>
                    <div><span className="text-xs uppercase text-muted-foreground">Escopo</span><div>{achievement.team?.name ?? 'Global'} / {achievement.album?.name ?? 'Global'}</div></div>
                    <div><span className="text-xs uppercase text-muted-foreground">Ícone</span><div>{achievement.icon ?? '-'}</div></div>
                    <div><span className="text-xs uppercase text-muted-foreground">Cor</span><div>{achievement.color ?? '-'}</div></div>
                </div>

                {can.grant ? (
                    <form onSubmit={submitGrant} className="grid gap-3 rounded-sm border p-4 md:grid-cols-3">
                        <div>
                            <label className="text-xs uppercase text-muted-foreground">Conceder para usuário</label>
                            <select value={grantForm.data.user_id} onChange={(event) => grantForm.setData('user_id', event.target.value)} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm">
                                <option value="">Selecione</option>
                                {users.map((user) => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}
                            </select>
                            {grantForm.errors.user_id ? <div className="mt-1 text-xs text-red-700">{grantForm.errors.user_id}</div> : null}
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs uppercase text-muted-foreground">Nota (opcional)</label>
                            <input value={grantForm.data.note} onChange={(event) => grantForm.setData('note', event.target.value)} className="mt-1 w-full rounded-sm border px-2 py-2 text-sm" />
                        </div>
                        <div className="md:col-span-3 flex justify-end">
                            <button type="submit" className="rounded-sm border bg-black px-3 py-2 text-sm text-white">Conceder</button>
                        </div>
                    </form>
                ) : null}

                <div className="rounded-sm border">
                    <div className="border-b px-4 py-3 text-sm font-medium">Usuários com conquista desbloqueada</div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="px-4 py-2">Usuário</th>
                                    <th className="px-4 py-2">Source</th>
                                    <th className="px-4 py-2">Álbum</th>
                                    <th className="px-4 py-2">Desbloqueada em</th>
                                </tr>
                            </thead>
                            <tbody>
                                {achievement.users.map((item) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="px-4 py-2">{item.user.email}</td>
                                        <td className="px-4 py-2">{item.source ?? '-'}</td>
                                        <td className="px-4 py-2">{item.album?.name ?? '-'}</td>
                                        <td className="px-4 py-2">{item.unlocked_at ?? '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

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
                                        <td className="px-4 py-2">{log.created_at ?? '-'}</td>
                                        <td className="px-4 py-2"><pre className="max-w-lg overflow-x-auto text-[11px]">{JSON.stringify(log.metadata ?? {}, null, 2)}</pre></td>
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
