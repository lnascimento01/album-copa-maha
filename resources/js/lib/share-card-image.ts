import { toPng } from 'html-to-image';

type NavigatorWithShare = Navigator & {
    canShare?: (data?: ShareData) => boolean;
    share?: (data?: ShareData) => Promise<void>;
};

async function nodeToPngDataUrl(node: HTMLElement): Promise<string> {
    // pixelRatio 2 keeps the exported image crisp for stories/feeds.
    return toPng(node, { pixelRatio: 2, cacheBust: true });
}

function triggerDownload(dataUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
}

/** Rasterize the card node to a PNG and download it. */
export async function downloadCardImage(node: HTMLElement, filename: string): Promise<void> {
    triggerDownload(await nodeToPngDataUrl(node), filename);
}

/**
 * Share the card as a PNG via the native share sheet (great on mobile). Falls
 * back to a plain download where Web Share with files is unsupported (most
 * desktops). Returns which path was taken.
 */
export async function shareCardImage(node: HTMLElement, filename: string, text: string): Promise<'shared' | 'downloaded'> {
    const dataUrl = await nodeToPngDataUrl(node);
    const nav = navigator as NavigatorWithShare;

    try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], filename, { type: 'image/png' });

        if (nav.canShare?.({ files: [file] }) && nav.share) {
            await nav.share({ files: [file], text, title: 'Álbum da Copa AAPH' });

            return 'shared';
        }
    } catch {
        // Fall through to download (e.g. user dismissed the share sheet or the
        // browser rejected the file share).
    }

    triggerDownload(dataUrl, filename);

    return 'downloaded';
}
