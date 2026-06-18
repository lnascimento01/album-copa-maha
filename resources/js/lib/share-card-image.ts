import { toPng } from 'html-to-image';

type NavigatorWithShare = Navigator & {
    canShare?: (data?: ShareData) => boolean;
    share?: (data?: ShareData) => Promise<void>;
};

export type SharePlatform = 'whatsapp' | 'instagram' | 'x' | 'telegram';

/**
 * Outcome of a share attempt:
 * - `shared`: the native share sheet handled it (image attached) — best case.
 * - `intent`: image downloaded + the network's web composer opened (text only).
 * - `downloaded`: image downloaded + caption copied; user posts manually.
 */
export type ShareResult = 'shared' | 'intent' | 'downloaded';

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

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
    const blob = await (await fetch(dataUrl)).blob();

    return new File([blob], filename, { type: 'image/png' });
}

/** Try the native share sheet with the PNG attached. True if it went through. */
async function tryNativeFileShare(file: File, text: string): Promise<boolean> {
    const nav = navigator as NavigatorWithShare;

    try {
        if (nav.canShare?.({ files: [file] }) && nav.share) {
            await nav.share({ files: [file], text, title: 'Álbum da Copa AAPH' });

            return true;
        }
    } catch {
        // User dismissed the sheet or the browser refused the file share —
        // the caller falls back to download.
    }

    return false;
}

function openIntent(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
}

async function copyText(text: string): Promise<void> {
    try {
        await navigator.clipboard?.writeText(text);
    } catch {
        // Clipboard may be blocked; the caption is still visible in the UI.
    }
}

/** Rasterize the card node to a PNG and download it. */
export async function downloadCardImage(node: HTMLElement, filename: string): Promise<void> {
    triggerDownload(await nodeToPngDataUrl(node), filename);
}

/**
 * Generic share: native file share (great on mobile) with a download fallback
 * where Web Share with files is unsupported (most desktops).
 */
export async function shareCardImage(node: HTMLElement, filename: string, text: string): Promise<'shared' | 'downloaded'> {
    const dataUrl = await nodeToPngDataUrl(node);
    const file = await dataUrlToFile(dataUrl, filename);

    if (await tryNativeFileShare(file, text)) {
        return 'shared';
    }

    triggerDownload(dataUrl, filename);

    return 'downloaded';
}

/**
 * Share to a specific network. On mobile the native sheet attaches the PNG
 * directly into the chosen app (ready to post). On desktop there is no
 * image-aware web intent for these networks, so we download the image (to
 * attach) and open the network's composer with the caption — or, for Instagram
 * which has no web composer, copy the caption and open the site.
 */
export async function shareToPlatform(
    node: HTMLElement,
    filename: string,
    platform: SharePlatform,
    text: string,
    url: string,
): Promise<ShareResult> {
    const dataUrl = await nodeToPngDataUrl(node);
    const file = await dataUrlToFile(dataUrl, filename);

    // Best path: native share sheet with the image attached.
    if (await tryNativeFileShare(file, text)) {
        return 'shared';
    }

    // Desktop fallback: download the image so it can be attached, then route to
    // the network.
    triggerDownload(dataUrl, filename);

    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);

    switch (platform) {
        case 'whatsapp':
            openIntent(`https://wa.me/?text=${encodedText}`);

            return 'intent';
        case 'x':
            openIntent(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`);

            return 'intent';
        case 'telegram':
            openIntent(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`);

            return 'intent';
        case 'instagram':
            // Instagram has no web post intent — copy the caption and open the
            // site; the image is already downloaded for upload.
            await copyText(text);
            openIntent('https://www.instagram.com');

            return 'downloaded';
    }
}
