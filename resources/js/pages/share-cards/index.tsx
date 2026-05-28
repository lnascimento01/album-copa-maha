import { Head, Link, useForm } from '@inertiajs/react';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';

type PaginationLink = { url: string | null; label: string; active: boolean };

type Card = {
    id: number;
    type: string;
    title: string;
    subtitle: string | null;
    created_at: string | null;
    payload: Record<string, unknown>;
    album: { id: number; name: string; slug: string } | null;
};

type Props = {
    cards: { data: Card[]; links: PaginationLink[] };
};

export default function ShareCardsIndex({ cards }: Props) {
    const cardForm = useForm({ type: 'album_progress', achievement_id: '' as number | string });

    return (
        <>
            <Head title="Meus Share Cards" />

            <div className="space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Meus Share Cards"
                    subtitle="Cards prontos para story, print ou compartilhamento manual."
                />

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        cardForm.post('/share-cards');
                    }}
                    className="grid gap-3 rounded-md border border-border bg-card p-4 md:grid-cols-3"
                >
                    <div>
                        <label className="text-xs uppercase tracking-wide text-dim">Tipo do card</label>
                        <select value={cardForm.data.type} onChange={(event) => cardForm.setData('type', event.target.value)} className="mt-1 w-full rounded-sm border bg-card border-border px-2 py-2 text-sm">
                            <option value="album_progress">Progresso do álbum</option>
                            <option value="pack_opened">Último pacote aberto</option>
                            <option value="sticker_unlocked">Última figurinha desbloqueada</option>
                            <option value="social_mission_approved">Última missão aprovada</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 flex items-end justify-end">
                        <button type="submit" className="rounded-sm border bg-primary px-3 py-2 text-sm text-primary-foreground" disabled={cardForm.processing}>Gerar card</button>
                    </div>
                </form>

                <DataTableShell title="Cards gerados" subtitle="Histórico dos cards prontos para compartilhamento.">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Título</th>
                                <th className="px-4 py-2">Álbum</th>
                                <th className="px-4 py-2">Criado em</th>
                                <th className="px-4 py-2">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cards.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8">
                                        <EmptyState title="Nenhum card criado ainda." description="Gere seu primeiro card para compartilhar sua temporada." />
                                    </td>
                                </tr>
                            ) : (
                                cards.data.map((card) => (
                                    <tr key={card.id} className="border-b border-border/60">
                                        <td className="px-4 py-2 font-mono text-xs text-dim">#{card.id}</td>
                                        <td className="px-4 py-2 text-dim">{card.type}</td>
                                        <td className="px-4 py-2 text-foreground">{card.title}</td>
                                        <td className="px-4 py-2 text-dim">{card.album?.name ?? '-'}</td>
                                        <td className="px-4 py-2 text-dim">{card.created_at ?? '-'}</td>
                                        <td className="px-4 py-2"><Link href={`/share-cards/${card.id}`} className="text-xs underline">Ver</Link></td>
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
