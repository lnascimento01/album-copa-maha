import { Copy, Download, Instagram, MessageCircle, Send, Share2, Twitter } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ComponentType } from 'react';
import ShareCardPreview from '@/components/share-card-preview';
import type { ShareCardFormat } from '@/components/share-card-preview';
import { downloadCardImage, shareCardImage, shareToPlatform } from '@/lib/share-card-image';
import type { SharePlatform } from '@/lib/share-card-image';

type Busy = null | 'download' | 'share' | SharePlatform;

type Props = {
    /** Payload rendered by {@link ShareCardPreview}. */
    payload: Record<string, unknown>;
    /** Caption suggested for the post / copied to clipboard. */
    shareCopy: string;
    /** Filename stem for the exported PNG (format suffix is appended). */
    fileBase: string;
};

const FORMATS: { id: ShareCardFormat; label: string; hint: string }[] = [
    { id: 'story', label: 'Stories', hint: '9:16' },
    { id: 'portrait', label: 'Feed retrato', hint: '4:5' },
    { id: 'square', label: 'Feed quadrado', hint: '1:1' },
];

const PLATFORMS: { id: SharePlatform; label: string; Icon: ComponentType<{ className?: string }> }[] = [
    { id: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle },
    { id: 'instagram', label: 'Instagram', Icon: Instagram },
    { id: 'x', label: 'X', Icon: Twitter },
    { id: 'telegram', label: 'Telegram', Icon: Send },
];

/**
 * Reusable "export as a post-ready image" panel: renders the share card and the
 * full action set (per-network share, generic share/download, copy caption).
 * Used by the share-cards page and inline on sticker / pack screens.
 */
export default function ShareExportPanel({ payload, shareCopy, fileBase }: Props) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [busy, setBusy] = useState<Busy>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [format, setFormat] = useState<ShareCardFormat>('story');

    const filename = `${fileBase}-${format}.png`;

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
            const result = await shareCardImage(cardRef.current, filename, shareCopy);
            setStatus(result === 'shared' ? 'Compartilhado!' : 'Compartilhamento direto indisponível — imagem baixada.');
        } catch {
            setStatus('Não foi possível compartilhar a imagem.');
        } finally {
            setBusy(null);
        }
    };

    const handlePlatform = async (platform: SharePlatform, label: string) => {
        if (!cardRef.current) {
            return;
        }

        setBusy(platform);
        setStatus(null);

        try {
            const result = await shareToPlatform(cardRef.current, filename, platform, shareCopy, window.location.origin);
            setStatus(
                result === 'shared'
                    ? `Enviado para o ${label}!`
                    : result === 'intent'
                      ? `Imagem baixada — anexe na janela do ${label} que abriu e poste.`
                      : `Imagem baixada e legenda copiada — abra o ${label} e poste.`,
            );
        } catch {
            setStatus(`Não foi possível preparar o compartilhamento para o ${label}.`);
        } finally {
            setBusy(null);
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(shareCopy);
        setStatus('Texto copiado.');
    };

    return (
        <ShareCardPreview
            ref={cardRef}
            payload={payload}
            format={format}
            footer={(
                <div className="space-y-3 text-xs">
                    {/* Format picker — switches the export aspect ratio per destination. */}
                    <div>
                        <div className="mb-1.5 uppercase tracking-wide text-dim">Formato</div>
                        <div className="flex flex-wrap gap-2">
                            {FORMATS.map((f) => (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => setFormat(f.id)}
                                    disabled={busy !== null}
                                    aria-pressed={format === f.id}
                                    className={`inline-flex items-center gap-1.5 rounded-sm border px-3 py-2 disabled:opacity-60 ${
                                        format === f.id
                                            ? 'border-primary bg-primary font-semibold text-primary-foreground'
                                            : 'border-border bg-card'
                                    }`}
                                >
                                    {f.label}
                                    <span className={format === f.id ? 'text-primary-foreground/70' : 'text-dim'}>{f.hint}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* One-tap, post-ready share per network. */}
                    <div>
                        <div className="mb-1.5 uppercase tracking-wide text-dim">Postar nas redes</div>
                        <div className="flex flex-wrap gap-2">
                            {PLATFORMS.map(({ id, label, Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => handlePlatform(id, label)}
                                    disabled={busy !== null}
                                    className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-2 font-semibold disabled:opacity-60"
                                >
                                    <Icon className="size-4" />
                                    {busy === id ? 'Gerando…' : label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generic / manual actions. */}
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
    );
}
