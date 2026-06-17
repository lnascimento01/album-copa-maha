import { ChevronLeft, ChevronRight, BookOpen, BookMarked } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { StickerAlbumSlot } from '@/components/album/sticker-album-slot';

type Team = { id: number; name: string; slug: string; short_name: string | null };

type AlbumSticker = {
    id: number;
    code: string;
    title: string;
    subtitle: string | null;
    rarity: string;
    imageUrl: string | null;
    unlocked: boolean;
    teamShort: string | null;
};

type AlbumStickerCell = AlbumSticker | null;

type Props = {
    coverImageUrl: string;
    albumName: string;
    season: string | null;
    teams: Team[];
    stickers: AlbumSticker[];
};

// One physical page holds a 2x3 grid of slots.
const PAGE_SIZE = 6;
// Single source of truth for the leaf-flip duration: fed to CSS via the
// --album-flip-dur custom property and reused to schedule the content commit.
const FLIP_MS = 720;

type FlipState = { dir: 'next' | 'prev'; from: number; to: number };

function chunkStickers(stickers: AlbumSticker[]): AlbumSticker[][] {
    if (stickers.length === 0) {
        return [[]];
    }

    const pages: AlbumSticker[][] = [];

    for (let index = 0; index < stickers.length; index += PAGE_SIZE) {
        pages.push(stickers.slice(index, index + PAGE_SIZE));
    }

    return pages;
}

function padPage(page: AlbumSticker[]): AlbumStickerCell[] {
    if (page.length >= PAGE_SIZE) {
        return page.slice(0, PAGE_SIZE);
    }

    return [...page, ...Array.from({ length: PAGE_SIZE - page.length }, () => null)];
}

export function AlbumBook({ coverImageUrl, albumName, season, teams, stickers }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [flip, setFlip] = useState<FlipState | null>(null);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReducedMotion(media.matches);

        update();
        media.addEventListener('change', update);

        return () => media.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        const media = window.matchMedia('(max-width: 980px)');
        const update = () => setIsMobile(media.matches);

        update();
        media.addEventListener('change', update);

        return () => media.removeEventListener('change', update);
    }, []);

    const pages = useMemo(() => chunkStickers(stickers), [stickers]);
    const totalPages = pages.length;

    // Commit the new page once the leaf has finished turning. A timeout keeps
    // this robust regardless of animationend/keyframe-name quirks; if the flip
    // is cleared earlier the cleanup cancels it.
    useEffect(() => {
        if (!flip) {
            return;
        }

        const timer = window.setTimeout(() => {
            setCurrentPage(flip.to);
            setFlip(null);
        }, FLIP_MS + 40);

        return () => window.clearTimeout(timer);
    }, [flip]);

    const pageStep = isMobile ? 1 : 2;
    const canPrev = currentPage > 0;
    const canNext = currentPage + pageStep < totalPages;

    // A desktop spread is the pair of facing pages around `page`.
    const spreadFor = (page: number) => {
        const left = page % 2 === 0 ? page : Math.max(0, page - 1);
        const right = left + 1;

        return {
            leftLabel: left + 1,
            rightLabel: Math.min(totalPages, right + 1),
            leftCells: padPage(pages[left] ?? []),
            rightCells: padPage(pages[right] ?? []),
        };
    };

    const goToPage = (direction: 'next' | 'prev') => {
        if (flip) {
            return;
        }

        if (direction === 'prev' && currentPage === 0) {
            setIsOpen(false);

            return;
        }

        if (direction === 'next' && !canNext) {
            return;
        }

        if (direction === 'prev' && !canPrev) {
            return;
        }

        const delta = direction === 'next' ? pageStep : -pageStep;
        const target = Math.max(0, Math.min(totalPages - 1, currentPage + delta));

        if (target === currentPage) {
            return;
        }

        if (reducedMotion) {
            setCurrentPage(target);

            return;
        }

        setFlip({ dir: direction, from: currentPage, to: target });
    };

    // ── Rendering helpers ───────────────────────────────────────────────
    const renderCells = (cells: AlbumStickerCell[], keyPrefix: string) =>
        cells.map((sticker, index) =>
            sticker ? (
                <StickerAlbumSlot
                    key={sticker.id}
                    id={sticker.id}
                    code={sticker.code}
                    title={sticker.title}
                    subtitle={sticker.subtitle}
                    rarity={sticker.rarity}
                    imageUrl={sticker.imageUrl}
                    unlocked={sticker.unlocked}
                    teamShort={sticker.teamShort}
                />
            ) : (
                <StickerAlbumSlot key={`${keyPrefix}-empty-${index}`} empty />
            ),
        );

    const pageFace = (label: number | string, cells: AlbumStickerCell[], keyPrefix: string) => (
        <>
            <header className="album-book__page-header">
                <p>Página {label}</p>
            </header>
            <div className="album-book__slots album-page-grid">{renderCells(cells, keyPrefix)}</div>
        </>
    );

    // ── Layered page model ──────────────────────────────────────────────
    // During a flip the static base is a hybrid (old side + revealed new
    // side) so the turning leaf — front = outgoing page, back = incoming
    // page — never exposes the new page before it physically lands.
    const committed = spreadFor(currentPage);
    const fromSpread = flip ? spreadFor(flip.from) : committed;
    const toSpread = flip ? spreadFor(flip.to) : committed;

    let baseLeft = committed.leftCells;
    let baseLeftLabel: number | string = committed.leftLabel;
    let baseRight = committed.rightCells;
    let baseRightLabel: number | string = committed.rightLabel;

    if (flip?.dir === 'next') {
        baseLeft = fromSpread.leftCells;
        baseLeftLabel = fromSpread.leftLabel;
        baseRight = toSpread.rightCells;
        baseRightLabel = toSpread.rightLabel;
    } else if (flip?.dir === 'prev') {
        baseLeft = toSpread.leftCells;
        baseLeftLabel = toSpread.leftLabel;
        baseRight = fromSpread.rightCells;
        baseRightLabel = fromSpread.rightLabel;
    }

    const leafSide = flip?.dir === 'next' ? 'right' : 'left';
    const leafFront = flip?.dir === 'next' ? fromSpread.rightCells : fromSpread.leftCells;
    const leafFrontLabel = flip?.dir === 'next' ? fromSpread.rightLabel : fromSpread.leftLabel;
    const leafBack = flip?.dir === 'next' ? toSpread.leftCells : toSpread.rightCells;
    const leafBackLabel = flip?.dir === 'next' ? toSpread.leftLabel : toSpread.rightLabel;

    // Mobile turns a single full-width leaf.
    const mobileBase = padPage(pages[flip ? flip.to : currentPage] ?? []);
    const mobileBaseLabel = (flip ? flip.to : currentPage) + 1;
    const mobileLeafFront = flip ? padPage(pages[flip.from] ?? []) : [];
    const mobileLeafBack = flip ? padPage(pages[flip.to] ?? []) : [];

    const flipClass = flip ? `is-flipping-${flip.dir}` : '';

    return (
        <section
            className={`album-book ${isOpen ? 'is-open' : 'is-closed'} ${flipClass}`}
            style={{ '--album-flip-dur': `${FLIP_MS}ms` } as React.CSSProperties}
        >
            <div className="album-book__shell">
                <div className="album-book__stage album-stage">
                    <div className="album-book__cover-stage album-cover-stage">
                        <button
                            type="button"
                            className="album-book__cover"
                            onClick={() => setIsOpen(true)}
                            aria-label="Abrir álbum"
                        >
                            <span className="album-book__shadow" />
                            <span className="album-book__cover-spine" />
                            <span className="album-book__cover-frame">
                                <img src={coverImageUrl} alt={`Capa do ${albumName}`} className="album-book__cover-image album-cover-image" />
                            </span>
                            <span className="album-book__cover-caption">
                                <span className="album-book__cover-kicker">Álbum da Copa AAPH</span>
                                <strong className="album-book__cover-title">{albumName}</strong>
                                <span className="album-book__cover-subtitle">{season ? `Temporada ${season}` : 'Temporada oficial'} · {teams.length} equipes</span>
                            </span>
                        </button>

                        {!isOpen ? (
                            <div className="album-book__cover-actions album-cover-actions">
                                <button type="button" onClick={() => setIsOpen(true)} className="album-book__button album-book__button--primary">
                                    <BookOpen className="size-4" /> Abrir álbum
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <div className="album-book__pages" aria-hidden={!isOpen}>
                        <span className="album-book__crease" />

                        <div className="album-book__spread album-spread" role="region" aria-label={`Página ${currentPage + 1} de ${totalPages}`}>
                            <article className="album-book__page album-page album-book__page--left">
                                {pageFace(baseLeftLabel, baseLeft, `left-${baseLeftLabel}`)}
                            </article>

                            <article className="album-book__page album-page album-book__page--right">
                                {pageFace(baseRightLabel, baseRight, `right-${baseRightLabel}`)}
                            </article>

                            {flip ? (
                                <div className={`album-book__leaf album-book__leaf--${leafSide}`} aria-hidden>
                                    <div className="album-book__page album-page album-book__leaf-face album-book__leaf-face--front">
                                        {pageFace(leafFrontLabel, leafFront, 'leaf-front')}
                                        <span className="album-book__leaf-shade" />
                                    </div>
                                    <div className="album-book__page album-page album-book__leaf-face album-book__leaf-face--back">
                                        {pageFace(leafBackLabel, leafBack, 'leaf-back')}
                                        <span className="album-book__leaf-shade" />
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="album-book__mobile-stage">
                            <article className="album-book__mobile-page album-page" role="region" aria-label={`Página ${mobileBaseLabel} de ${totalPages}`}>
                                {pageFace(mobileBaseLabel, mobileBase, `mobile-${mobileBaseLabel}`)}
                            </article>

                            {flip ? (
                                <div className={`album-book__mobile-leaf album-book__mobile-leaf--${leafSide}`} aria-hidden>
                                    <div className="album-book__page album-page album-book__leaf-face album-book__leaf-face--front">
                                        {pageFace(flip.from + 1, mobileLeafFront, 'mleaf-front')}
                                        <span className="album-book__leaf-shade" />
                                    </div>
                                    <div className="album-book__page album-page album-book__leaf-face album-book__leaf-face--back">
                                        {pageFace(flip.to + 1, mobileLeafBack, 'mleaf-back')}
                                        <span className="album-book__leaf-shade" />
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {isOpen ? (
                        <div className="album-book__controls">
                            <>
                                <button type="button" onClick={() => goToPage('prev')} disabled={flip !== null} className="album-book__button" aria-label={canPrev ? 'Página anterior' : 'Voltar capa'}>
                                    <ChevronLeft className="size-4" />
                                    {!isMobile && <span>{canPrev ? 'Página anterior' : 'Voltar capa'}</span>}
                                </button>
                                <span className="album-book__page-indicator">
                                    {isMobile ? `${currentPage + 1} / ${totalPages}` : `Páginas ${committed.leftLabel}-${committed.rightLabel} de ${totalPages}`}
                                </span>
                                <button type="button" onClick={() => goToPage('next')} disabled={!canNext || flip !== null} className="album-book__button" aria-label="Próxima página">
                                    {!isMobile && <span>Próxima página</span>}
                                    <ChevronRight className="size-4" />
                                </button>
                                <button type="button" onClick={() => setIsOpen(false)} className="album-book__button album-book__button--ghost" aria-label="Fechar álbum">
                                    <BookMarked className="size-4" />
                                    {!isMobile && <span>Fechar álbum</span>}
                                </button>
                            </>
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
