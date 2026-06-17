import { router, usePage } from '@inertiajs/react';
import { driver } from 'driver.js';
import type { Config, DriveStep } from 'driver.js';
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

type TourUser = {
    roles?: string[];
    permissions?: string[];
    preferences?: { tours?: Record<string, string> } | null;
};

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

    useEffect(() => {
        if (!enabled || !isAlbumUser || completed || !prerequisiteDone || startedRef.current) {
            return;
        }

        const timer = window.setTimeout(() => {
            startedRef.current = startTour();
        }, 700);

        return () => window.clearTimeout(timer);
    }, [enabled, isAlbumUser, completed, prerequisiteDone, startTour]);

    return null;
}
