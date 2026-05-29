import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type Props = {
    page: number;
    pageCount: number;
    totalSlots: number;
    canPrev: boolean;
    canNext: boolean;
    onPrev: () => void;
    onNext: () => void;
    children: ReactNode;
};

export function AlbumPageSpread({ page, pageCount, totalSlots, canPrev, canNext, onPrev, onNext, children }: Props) {
    const previousPage = useRef(page);
    const [turnClass, setTurnClass] = useState('');

    useEffect(() => {
        if (previousPage.current === page) {
            return;
        }

        const direction = page > previousPage.current ? 'is-turning-next' : 'is-turning-prev';
        setTurnClass(direction);
        previousPage.current = page;

        const timeout = window.setTimeout(() => setTurnClass(''), 260);

        return () => window.clearTimeout(timeout);
    }, [page]);

    return (
        <section className="album-paper p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold tracking-[0.12em] text-dim uppercase">
                    Página {page} de {pageCount} · {totalSlots} slots
                </p>
                <div className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/60 p-1">
                    <button
                        type="button"
                        onClick={onPrev}
                        disabled={!canPrev}
                        className="inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2 py-1 text-xs font-medium text-foreground transition hover:border-primary/45 hover:bg-accent/45 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft className="size-3.5" /> Anterior
                    </button>
                    <span className="rounded-sm border border-border bg-card px-2 py-1 text-[11px] font-semibold text-foreground">
                        {page}/{pageCount}
                    </span>
                    <button
                        type="button"
                        onClick={onNext}
                        disabled={!canNext}
                        className="inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2 py-1 text-xs font-medium text-foreground transition hover:border-primary/45 hover:bg-accent/45 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Próxima <ChevronRight className="size-3.5" />
                    </button>
                </div>
            </div>

            <div className="album-page-viewport">
                <div className={`album-page-frame ${turnClass}`}>
                    <div className="album-spread">{children}</div>
                </div>
            </div>
        </section>
    );
}
