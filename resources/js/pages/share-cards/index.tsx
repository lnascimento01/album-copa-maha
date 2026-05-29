import { Head, Link, useForm } from '@inertiajs/react';
import { DataTableShell } from '@/components/ui/data-table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { ResponsiveDataList } from '@/components/ui/responsive-data-list';

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

            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader
                    title="Meus Share Cards"
                    subtitle="Cards prontos para story, print ou compartilhamento manual."
                />

                <section className="season-hero">
                    <div className="relative z-10">
                        <p className="season-kicker">Vitrine da coleção</p>
                        <h2 className="mt-2 text-2xl font-semibold text-primary-foreground">Mostre sua temporada</h2>
                        <p className="mt-1 max-w-2xl text-sm text-primary-foreground/85">
                            Gere cards com progresso, pacotes e conquistas para compartilhar com o time.
                        </p>
                    </div>
                </section>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        cardForm.post('/share-cards');
                    }}
                    className="album-paper grid gap-3 p-4 md:grid-cols-3"
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
                        <button type="submit" className="rounded-sm border border-primary bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground" disabled={cardForm.processing}>Gerar card</button>
                    </div>
                </form>

                <DataTableShell title="Cards gerados" subtitle="Histórico dos cards prontos para compartilhamento.">
                    <ResponsiveDataList
                        items={cards.data}
                        getKey={(card) => card.id}
                        empty={<EmptyState title="Nenhum card criado ainda." description="Gere seu primeiro card para compartilhar sua temporada." />}
                        renderItem={(card) => (
                            <div className="space-y-2">
                                <p className="font-mono text-xs text-dim">#{card.id}</p>
                                <p className="text-sm font-semibold text-foreground">{card.title}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="responsive-data-key">Tipo</p>
                                        <p className="responsive-data-value">{card.type}</p>
                                    </div>
                                    <div>
                                        <p className="responsive-data-key">Álbum</p>
                                        <p className="responsive-data-value">{card.album?.name ?? '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                    <p className="text-xs text-dim">{card.created_at ?? '-'}</p>
                                    <Link href={`/share-cards/${card.id}`} className="app-link-chip">Ver</Link>
                                </div>
                            </div>
                        )}
                    />
                    <table className="hidden min-w-full text-sm md:table">
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
                                    <tr key={card.id} className="admin-table-row">
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
