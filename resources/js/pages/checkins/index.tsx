import { Head, Link, router } from '@inertiajs/react';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { OriginBadge } from '@/components/ui/origin-badge';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';

type LinkItem = { url: string | null; label: string; active: boolean };

type Checkin = {
    id: number;
    status: string;
    checked_at: string | null;
    revoked_at: string | null;
    sticker_packs_count: number;
    source: 'admin' | 'self';
    activity: {
        id: number;
        title: string;
        type: string;
        status: string;
        starts_at: string | null;
        team: { id: number; name: string };
        album: { id: number; name: string };
    };
};

export default function CheckinsIndex({ checkins }: { checkins: { data: Checkin[]; links: LinkItem[] } }) {
    return (
        <>
            <Head title="Meus Check-ins" />
            <div className="space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Meus Check-ins"
                    subtitle="Histórico de presença confirmado pela administração ou por QR/código de atividade."
                    actions={<Link href="/packs" className="rounded-sm border border-zinc-300 px-3 py-2 text-xs">Ver pacotes</Link>}
                />

                <DataTableShell title="Histórico de presença" subtitle="Cada check-in confirmado pode gerar pacotes para sua coleção.">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-200 text-left">
                                <th className="px-4 py-2">Atividade</th>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Origem</th>
                                <th className="px-4 py-2">Data</th>
                                <th className="px-4 py-2">Pacotes</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {checkins.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8">
                                        <EmptyState title="Nenhum check-in confirmado." description="Participe das atividades abertas para começar seu histórico." />
                                    </td>
                                </tr>
                            ) : (
                                checkins.data.map((checkin) => (
                                    <tr key={checkin.id} className="border-b border-zinc-100">
                                        <td className="px-4 py-2 text-zinc-800">{checkin.activity.title}</td>
                                        <td className="px-4 py-2 text-zinc-700">{checkin.activity.type}</td>
                                        <td className="px-4 py-2"><StatusBadge value={checkin.status} /></td>
                                        <td className="px-4 py-2">
                                            {checkin.source === 'self' ? (
                                                <OriginBadge source="checkin" label="QR/Código" />
                                            ) : (
                                                <OriginBadge source="admin" label="Administração" />
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-zinc-600">{checkin.checked_at ?? '-'}</td>
                                        <td className="px-4 py-2 text-zinc-700">{checkin.sticker_packs_count}</td>
                                        <td className="px-4 py-2">
                                            <Link href={`/checkins/${checkin.id}`} className="text-xs underline">Detalhes</Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </DataTableShell>

                <div className="flex flex-wrap gap-2">
                    {checkins.links.map((link, index) => (
                        <button
                            key={`${link.label}-${index}`}
                            type="button"
                            onClick={() => link.url && router.visit(link.url)}
                            disabled={!link.url}
                            className={`rounded-sm border px-2 py-1 text-xs ${link.active ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-700'}`}
                        >
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
