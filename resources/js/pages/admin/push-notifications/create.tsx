import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

type User = { id: number; name: string; email: string };

type Props = { users: User[] };

export default function AdminPushNotificationsCreate({ users }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        body: '',
        url: '',
        target_type: 'all_users' as 'all_users' | 'specific_users',
        recipient_ids: [] as number[],
    });

    const [userSearch, setUserSearch] = useState('');

    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearch.toLowerCase()),
    );

    const toggleUser = (id: number) => {
        setData('recipient_ids', data.recipient_ids.includes(id)
            ? data.recipient_ids.filter((x) => x !== id)
            : [...data.recipient_ids, id],
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/push-notifications');
    };

    return (
        <>
            <Head title="Nova Notificação Push" />
            <div className="space-y-4 p-4">
                <h1 className="text-xl font-semibold tracking-tight">Nova Notificação Push</h1>

                <form onSubmit={submit} className="space-y-4">
                    <div className="rounded-sm border p-4 space-y-4">
                        <div>
                            <label className="text-xs uppercase text-muted-foreground">Título *</label>
                            <input
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="mt-1 w-full rounded-sm border px-3 py-2 text-sm"
                                placeholder="Ex: Nova missão disponível!"
                                maxLength={255}
                            />
                            {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="text-xs uppercase text-muted-foreground">Mensagem *</label>
                            <textarea
                                value={data.body}
                                onChange={(e) => setData('body', e.target.value)}
                                className="mt-1 w-full rounded-sm border px-3 py-2 text-sm"
                                rows={3}
                                placeholder="Texto da notificação..."
                                maxLength={2000}
                            />
                            {errors.body && <p className="mt-1 text-xs text-destructive">{errors.body}</p>}
                        </div>

                        <div>
                            <label className="text-xs uppercase text-muted-foreground">URL de destino (opcional)</label>
                            <input
                                value={data.url}
                                onChange={(e) => setData('url', e.target.value)}
                                className="mt-1 w-full rounded-sm border px-3 py-2 text-sm"
                                placeholder="https://..."
                                type="url"
                            />
                            {errors.url && <p className="mt-1 text-xs text-destructive">{errors.url}</p>}
                        </div>
                    </div>

                    <div className="rounded-sm border p-4 space-y-3">
                        <div className="text-xs uppercase text-muted-foreground">Destinatários</div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    name="target_type"
                                    value="all_users"
                                    checked={data.target_type === 'all_users'}
                                    onChange={() => setData('target_type', 'all_users')}
                                />
                                Todos os usuários aprovados
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    name="target_type"
                                    value="specific_users"
                                    checked={data.target_type === 'specific_users'}
                                    onChange={() => setData('target_type', 'specific_users')}
                                />
                                Usuários específicos
                            </label>
                        </div>

                        {data.target_type === 'specific_users' && (
                            <div className="space-y-2">
                                {data.recipient_ids.length > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        {data.recipient_ids.length} usuário(s) selecionado(s)
                                    </p>
                                )}
                                <input
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    className="w-full rounded-sm border px-3 py-2 text-sm"
                                    placeholder="Buscar por nome ou e-mail..."
                                />
                                <div className="max-h-60 overflow-y-auto rounded-sm border divide-y">
                                    {filteredUsers.length === 0 ? (
                                        <p className="px-3 py-3 text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
                                    ) : (
                                        filteredUsers.map((u) => (
                                            <label key={u.id} className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-accent">
                                                <input
                                                    type="checkbox"
                                                    checked={data.recipient_ids.includes(u.id)}
                                                    onChange={() => toggleUser(u.id)}
                                                />
                                                <span className="text-sm">
                                                    <span className="font-medium">{u.name}</span>{' '}
                                                    <span className="text-muted-foreground">{u.email}</span>
                                                </span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                {errors.recipient_ids && (
                                    <p className="text-xs text-destructive">{errors.recipient_ids}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-sm border bg-primary px-4 py-2 text-sm text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60"
                        >
                            {processing ? 'Enviando...' : 'Enviar notificação'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit('/admin/push-notifications')}
                            className="rounded-sm border px-4 py-2 text-sm transition-colors hover:bg-accent"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
