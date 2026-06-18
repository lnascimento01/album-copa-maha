import { Head, Link } from '@inertiajs/react';
import ShareExportPanel from '@/components/share-export-panel';
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
    const shareCopy = String(card.payload.share_copy ?? 'Minha temporada no Álbum da Copa AAPH segue evoluindo.');

    return (
        <>
            <Head title={`Share Card #${card.id}`} />

            <div className="brand-app-bg space-y-4 p-4 sm:p-5">
                <PageHeader
                    title={`Share Card #${card.id}`}
                    subtitle="Baixe a imagem ou compartilhe direto nas suas redes."
                    actions={<Link href="/share-cards" className="rounded-sm border bg-card border-border px-3 py-2 text-xs">Voltar</Link>}
                />

                <section className="campaign-panel">
                    <p className="text-[10px] font-semibold tracking-[0.14em] text-dim uppercase">Vitrine da temporada</p>
                    <p className="mt-1 text-sm text-foreground">Use este card para destacar evolução, presença e conquistas do álbum oficial.</p>
                </section>

                <ShareExportPanel payload={card.payload} shareCopy={shareCopy} fileBase={`share-card-${card.id}`} />
            </div>
        </>
    );
}
