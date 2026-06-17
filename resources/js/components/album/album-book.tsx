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

const PAGE_SIZE = 6;
const TURN_DURATION_MS = 360;

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
    const [turnDirection, setTurnDirection] = useState<'next' | 'prev' | null>(null);
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

    const leftPageIndex = currentPage % 2 === 0 ? currentPage : Math.max(0, currentPage - 1);
    const rightPageIndex = leftPageIndex + 1;
    const rightPageLabel = Math.min(totalPages, rightPageIndex + 1);

    const leftPage = padPage(pages[leftPageIndex] ?? []);
    const rightPage = padPage(pages[rightPageIndex] ?? []);
    const mobilePage = padPage(pages[currentPage] ?? []);

    const pageStep = isMobile ? 1 : 2;
    const canPrev = currentPage > 0;
    const canNext = currentPage + pageStep < totalPages;

    const goToPage = (direction: 'next' | 'prev') => {
        if (turnDirection) {
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

        if (reducedMotion) {
            setCurrentPage((page) => {
                const delta = direction === 'next' ? pageStep : -pageStep;

                return Math.max(0, Math.min(totalPages - 1, page + delta));
            });

            return;
        }

        setTurnDirection(direction);
        window.setTimeout(() => {
            setCurrentPage((page) => {
                const delta = direction === 'next' ? pageStep : -pageStep;

                return Math.max(0, Math.min(totalPages - 1, page + delta));
            });
            setTurnDirection(null);
        }, TURN_DURATION_MS / 2);
    };

    return (
        <section className={`album-book ${isOpen ? 'is-open' : 'is-closed'} ${turnDirection === 'next' ? 'is-turning-next' : ''} ${turnDirection === 'prev' ? 'is-turning-prev' : ''}`}>
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
                                <header className="album-book__page-header">
                                    <p>Página {leftPageIndex + 1}</p>
                                </header>
                                <div className="album-book__slots album-page-grid">
                                    {leftPage.map((sticker, index) => (
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
                                            <StickerAlbumSlot key={`left-empty-${leftPageIndex}-${index}`} empty />
                                        )
                                    ))}
                                </div>
                            </article>

                            <article className="album-book__page album-page album-book__page--right">
                                <header className="album-book__page-header">
                                    <p>Página {rightPageLabel}</p>
                                </header>
                                <div className="album-book__slots album-page-grid">
                                    {rightPage.map((sticker, index) => (
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
                                            <StickerAlbumSlot key={`right-empty-${rightPageIndex}-${index}`} empty />
                                        )
                                    ))}
                                </div>
                            </article>
                        </div>

                        <article className="album-book__mobile-page album-page" role="region" aria-label={`Página ${currentPage + 1} de ${totalPages}`}>
                            <header className="album-book__page-header">
                                <p>Página {currentPage + 1}</p>
                            </header>
                            <div className="album-book__slots album-page-grid">
                                {mobilePage.map((sticker, index) => (
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
                                        <StickerAlbumSlot key={`mobile-empty-${currentPage}-${index}`} empty />
                                    )
                                ))}
                            </div>
                        </article>
                    </div>

                    {isOpen ? (
                        <div className="album-book__controls">
                            <>
                                <button type="button" onClick={() => goToPage('prev')} disabled={turnDirection !== null} className="album-book__button" aria-label={canPrev ? 'Página anterior' : 'Voltar capa'}>
                                    <ChevronLeft className="size-4" />
                                    {!isMobile && <span>{canPrev ? 'Página anterior' : 'Voltar capa'}</span>}
                                </button>
                                <span className="album-book__page-indicator">
                                    {isMobile ? `${currentPage + 1} / ${totalPages}` : `Páginas ${leftPageIndex + 1}-${rightPageLabel} de ${totalPages}`}
                                </span>
                                <button type="button" onClick={() => goToPage('next')} disabled={!canNext || turnDirection !== null} className="album-book__button" aria-label="Próxima página">
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
