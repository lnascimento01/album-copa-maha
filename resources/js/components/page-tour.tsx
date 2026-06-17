import { router, usePage } from '@inertiajs/react';
import { driver } from 'driver.js';
import type { Config, DriveStep } from 'driver.js';
import { Compass } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import 'driver.js/dist/driver.css';

const DRIVER_CONFIG: Config = {
    showProgress: true,
    allowClose: true,
    overlayColor: 'rgba(7, 17, 31, 0.72)',
    stagePadding: 6,
    stageRadius: 8,
    nextBtnText: 'Próximo',
    prevBtnText: 'Voltar',
    doneBtnText: 'Concluir',
    progressText: '{{current}} de {{total}}',
};

const REPLAY_EVENT_PREFIX = 'page-tour:start:';

/** Replays the page tour with the given key (used by TourReplayButton). */
export function startPageTour(tourKey: string): void {
    window.dispatchEvent(new CustomEvent(`${REPLAY_EVENT_PREFIX}${tourKey}`));
}

type TourUser = {
    roles?: string[];
    permissions?: string[];
    preferences?: { tours?: Record<string, string> } | null;
};

function useIsAlbumUser(): boolean {
    const page = usePage<{ auth: { user?: TourUser | null } }>();
    const user = page.props.auth.user;

    return !!user && !(user.roles ?? []).includes('admin');
}

type Props = {
    /** Unique key; completion is stored per key in preferences.tours[tourKey]. */
    tourKey: string;
    steps: DriveStep[];
    /** Gate so this page tour only runs after the given tour is done (default: the main menu tour). */
    requiresTour?: string | null;
    /** Page-level guard (e.g. only when there is something to teach). */
    enabled?: boolean;
};

/**
 * Lightweight per-page onboarding tour (driver.js). Auto-starts once for
 * non-admin users who haven't completed THIS tour, after the prerequisite tour
 * (the main menu by default) is done — so tours don't stack on a first visit.
 * Targets that aren't in the DOM are skipped, and if nothing is left to show
 * the tour is not started (and not marked complete) so it can run later.
 * Can also be replayed on demand via startPageTour(tourKey) / TourReplayButton.
 */
export function PageTour({ tourKey, steps, requiresTour = 'main-menu', enabled = true }: Props) {
    const page = usePage<{ auth: { user?: TourUser | null } }>();
    const startedRef = useRef(false);

    const user = page.props.auth.user;
    const roles = user?.roles ?? [];
    const tours = user?.preferences?.tours ?? {};
    const isAlbumUser = !!user && !roles.includes('admin');
    const completed = Boolean(tours[tourKey]);
    const prerequisiteDone = !requiresTour || Boolean(tours[requiresTour]);

    const startTour = useCallback(() => {
        const live = steps.filter((step) => !step.element || document.querySelector(step.element as string));

        // Nothing anchored on this page yet — don't run or mark complete.
        if (live.length === 0 || (live.length === 1 && live[0].element)) {
            return false;
        }

        const instance = driver({
            ...DRIVER_CONFIG,
            steps: live,
            onDestroyed: () => {
                router.post(`/onboarding/tour/${tourKey}/complete`, {}, { preserveScroll: true, preserveState: true });
            },
        });
        instance.drive();

        return true;
    }, [steps, tourKey]);

    // Auto-start once.
    useEffect(() => {
        if (!enabled || !isAlbumUser || completed || !prerequisiteDone || startedRef.current) {
            return;
        }

        const timer = window.setTimeout(() => {
            startedRef.current = startTour();
        }, 700);

        return () => window.clearTimeout(timer);
    }, [enabled, isAlbumUser, completed, prerequisiteDone, startTour]);

    // Manual replay (explicit user action — bypasses the completion gate).
    useEffect(() => {
        const handler = () => startTour();
        const eventName = `${REPLAY_EVENT_PREFIX}${tourKey}`;
        window.addEventListener(eventName, handler);

        return () => window.removeEventListener(eventName, handler);
    }, [startTour, tourKey]);

    return null;
}

type ReplayButtonProps = {
    tourKey: string;
    label?: string;
    className?: string;
};

/** Contextual "replay this page's tour" button (non-admin users only). */
export function TourReplayButton({ tourKey, label = 'Rever tour', className }: ReplayButtonProps) {
    const isAlbumUser = useIsAlbumUser();

    if (!isAlbumUser) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={() => startPageTour(tourKey)}
            className={
                className ??
                'inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/60'
            }
        >
            <Compass className="size-3.5" aria-hidden />
            {label}
        </button>
    );
}
