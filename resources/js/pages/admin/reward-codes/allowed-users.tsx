import { Head, Link, router, useForm } from '@inertiajs/react';

type RewardCode = { id: number; code: string; title: string; status: string };
type User = { id: number; name: string; email: string };

type Props = {
    rewardCode: RewardCode;
    allowedUsers: User[];
    users: User[];
    search: string;
};

export default function AdminRewardCodeAllowedUsers({ rewardCode, allowedUsers, users, search }: Props) {
    const form = useForm({ user_id: '' });

    const addUser = (userId: number) => {
        router.post(`/admin/reward-codes/${rewardCode.id}/allowed-users`, { user_id: userId });
    };

    const removeUser = (userId: number) => {
        router.delete(`/admin/reward-codes/${rewardCode.id}/allowed-users/${userId}`);
    };

    const handleSearch = (value: string) => {
        router.get(`/admin/reward-codes/${rewardCode.id}/allowed-users`, { search: value }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title={`Usuários autorizados — ${rewardCode.code}`} />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <Link href={`/admin/reward-codes/${rewardCode.id}`} className="text-xs text-muted-foreground hover:underline">
                            ← {rewardCode.code}
                        </Link>
                        <h1 className="mt-1 text-xl font-semibold tracking-tight">Usuários autorizados</h1>
                        <p className="text-sm text-muted-foreground">Somente estes usuários poderão resgatar o código <strong>{rewardCode.code}</strong>.</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="album-paper p-4">
                        <h2 className="mb-3 text-sm font-medium">Autorizados ({allowedUsers.length})</h2>
                        {allowedUsers.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhum usuário autorizado. Sem restrição — qualquer um pode resgatar.</p>
                        ) : (
                            <ul className="space-y-2">
                                {allowedUsers.map((user) => (
                                    <li key={user.id} className="flex items-center justify-between gap-2 rounded-sm border border-border p-2 text-sm">
                                        <div>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeUser(user.id)}
                                            className="shrink-0 rounded-sm border border-border px-2 py-1 text-xs transition-colors hover:bg-destructive hover:text-destructive-foreground"
                                        >
                                            Remover
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="album-paper p-4">
                        <h2 className="mb-3 text-sm font-medium">Adicionar usuário</h2>
                        <input
                            type="search"
                            placeholder="Buscar por nome ou e-mail..."
                            defaultValue={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="mb-3 w-full rounded-sm border border-border bg-card px-2 py-2 text-sm"
                        />
                        {users.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{search ? 'Nenhum resultado.' : 'Digite para buscar.'}</p>
                        ) : (
                            <ul className="space-y-2">
                                {users.map((user) => (
                                    <li key={user.id} className="flex items-center justify-between gap-2 rounded-sm border border-border p-2 text-sm">
                                        <div>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => addUser(user.id)}
                                            className="shrink-0 rounded-sm border border-primary bg-primary px-2 py-1 text-xs text-primary-foreground transition-all hover:brightness-110"
                                        >
                                            Adicionar
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
