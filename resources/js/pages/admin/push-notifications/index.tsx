import { Head, Link } from '@inertiajs/react';
import { fmtDateTimeBr } from '@/lib/date';

type Notification = {
    id: number;
    title: string;
    body: string;
    url: string | null;
    target_type: string;
    recipients_count: number;
    sent_by: { id: number; email: string } | null;
    created_at: string | null;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

type Props = {
    notifications: { data: Notification[]; links: PaginationLink[] };
};

export default function AdminPushNotificationsIndex({ notifications }: Props) {
    return (
        <>
            <Head title="Notificações Push" />
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-2">
                    <h1 className="text-xl font-semibold tracking-tight">Notificações Push</h1>
                    <Link
                        href="/admin/push-notifications/create"
                        className="rounded-sm border bg-primary px-3 py-2 text-xs text-primary-foreground"
                    >
                        Nova notificação
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-sm border">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="px-4 py-2">Título</th>
                                <th className="px-4 py-2">Mensagem</th>
                                <th className="px-4 py-2">Destino</th>
                                <th className="px-4 py-2">Destinatários</th>
                                <th className="px-4 py-2">Enviado por</th>
                                <th className="px-4 py-2">Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                                        Nenhuma notificação enviada ainda.
                                    </td>
                                </tr>
                            ) : (
                                notifications.data.map((n) => (
                                    <tr key={n.id} className="border-b">
                                        <td className="px-4 py-2 font-medium">{n.title}</td>
                                        <td className="max-w-xs truncate px-4 py-2 text-muted-foreground">{n.body}</td>
                                        <td className="px-4 py-2">
                                            {n.target_type === 'all_users' ? 'Todos os usuários' : 'Usuários específicos'}
                                        </td>
                                        <td className="px-4 py-2">{n.recipients_count}</td>
                                        <td className="px-4 py-2">{n.sent_by?.email ?? '-'}</td>
                                        <td className="px-4 py-2 text-muted-foreground">{fmtDateTimeBr(n.created_at)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap gap-2">
                    {notifications.links.map((link, index) => (
                        <a
                            key={`${link.label}-${index}`}
                            href={link.url ?? '#'}
                            className={`rounded-sm border px-2 py-1 text-xs ${link.active ? 'bg-primary text-primary-foreground' : ''} ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
