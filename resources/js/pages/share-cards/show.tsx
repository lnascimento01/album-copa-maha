import { Head, Link } from '@inertiajs/react';
import ShareCardPreview from '@/components/share-card-preview';
import { PageHeader } from '@/components/ui/page-header';

type Props = {
    card: {
        id: number;
        type: string;
        title: string;
        subtitle: string | null;
        payload: {
            share_copy?: string;
            [key: string]: unknown;
        };
        created_at: string | null;
        album: { id: number; name: string; slug: string } | null;
        user: { id: number; name: string; email: string };
    };
};

export default function ShareCardsShow({ card }: Props) {
    const shareCopy = card.payload.share_copy ?? 'Minha temporada no Álbum da Copa MAHA segue evoluindo.';

    return (
        <>
            <Head title={`Share Card #${card.id}`} />

            <div className="space-y-4 p-4 sm:p-5">
                <PageHeader
                    title={`Share Card #${card.id}`}
                    subtitle="Card pronto para story, print manual ou compartilhamento textual."
                    actions={<Link href="/share-cards" className="rounded-sm border border-zinc-300 px-3 py-2 text-xs">Voltar</Link>}
                />

                <ShareCardPreview
                    payload={card.payload}
                    footer={(
                        <div className="space-y-2 text-xs">
                            <div className="rounded-sm border border-zinc-300 bg-white p-3">
                                <div className="uppercase tracking-wide text-zinc-500">Texto para compartilhar</div>
                                <p className="mt-1 text-zinc-800">{shareCopy}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    className="rounded-sm border border-zinc-300 bg-white px-2 py-1"
                                    onClick={() => navigator.clipboard.writeText(String(shareCopy))}
                                >
                                    Copiar texto
                                </button>
                                <span className="rounded-sm border border-zinc-300 bg-zinc-50 px-2 py-1 text-zinc-600">
                                    Exportação de imagem: use print manual do card nesta etapa.
                                </span>
                            </div>
                        </div>
                    )}
                />

                <div className="rounded-md border border-zinc-200 bg-white p-4">
                    <div className="text-xs uppercase tracking-wide text-zinc-500">Payload</div>
                    <pre className="mt-2 overflow-x-auto text-xs text-zinc-700">{JSON.stringify(card.payload, null, 2)}</pre>
                </div>
            </div>
        </>
    );
}
