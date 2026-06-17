import { Head, Link } from '@inertiajs/react';
import { Copy, Download, Share2 } from 'lucide-react';
import { useRef, useState } from 'react';
import ShareCardPreview from '@/components/share-card-preview';
import { PageHeader } from '@/components/ui/page-header';
import { downloadCardImage, shareCardImage } from '@/lib/share-card-image';

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
    const shareCopy = card.payload.share_copy ?? 'Minha temporada no Álbum da Copa AAPH segue evoluindo.';
    const cardRef = useRef<HTMLDivElement>(null);
    const [busy, setBusy] = useState<null | 'download' | 'share'>(null);
    const [status, setStatus] = useState<string | null>(null);

    const filename = `share-card-${card.id}.png`;

    const handleDownload = async () => {
        if (!cardRef.current) {
            return;
        }

        setBusy('download');
        setStatus(null);

        try {
            await downloadCardImage(cardRef.current, filename);
            setStatus('Imagem baixada.');
        } catch {
            setStatus('Não foi possível gerar a imagem.');
        } finally {
            setBusy(null);
        }
    };

    const handleShare = async () => {
        if (!cardRef.current) {
            return;
        }

        setBusy('share');
        setStatus(null);

        try {
            const result = await shareCardImage(cardRef.current, filename, String(shareCopy));
            setStatus(result === 'shared' ? 'Compartilhado!' : 'Compartilhamento direto indisponível — imagem baixada.');
        } catch {
            setStatus('Não foi possível compartilhar a imagem.');
        } finally {
            setBusy(null);
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(String(shareCopy));
        setStatus('Texto copiado.');
    };

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

                <ShareCardPreview
                    ref={cardRef}
                    payload={card.payload}
                    footer={(
                        <div className="space-y-2 text-xs">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={handleShare}
                                    disabled={busy !== null}
                                    className="inline-flex items-center gap-1.5 rounded-sm border border-primary bg-primary px-3 py-2 font-semibold text-primary-foreground disabled:opacity-60"
                                >
                                    <Share2 className="size-4" />
                                    {busy === 'share' ? 'Gerando…' : 'Compartilhar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    disabled={busy !== null}
                                    className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-2 disabled:opacity-60"
                                >
                                    <Download className="size-4" />
                                    {busy === 'download' ? 'Gerando…' : 'Baixar imagem'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    disabled={busy !== null}
                                    className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-2 disabled:opacity-60"
                                >
                                    <Copy className="size-4" />
                                    Copiar texto
                                </button>
                            </div>
                            <div className="rounded-sm border border-border bg-card p-3">
                                <div className="uppercase tracking-wide text-dim">Texto para compartilhar</div>
                                <p className="mt-1 text-foreground">{shareCopy}</p>
                            </div>
                            {status ? <p className="text-dim" aria-live="polite">{status}</p> : null}
                        </div>
                    )}
                />
            </div>
        </>
    );
}
