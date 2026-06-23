import { router, usePage } from '@inertiajs/react';
import { driver } from 'driver.js';
import type { Config } from 'driver.js';
import { useCallback, useEffect, useRef } from 'react';
import 'driver.js/dist/driver.css';
import { useSidebar } from '@/components/ui/sidebar';

const TOUR_KEY = 'pool-intro';
const NAV_SELECTOR = '[data-tour="nav-pool"]';

const DRIVER_CONFIG: Config = {
    showProgress: false,
    allowClose: true,
    // Block clicks on the highlighted menu link so the tour only advances via
    // its button (tapping the link would navigate and close the mobile drawer).
    disableActiveInteraction: true,
    overlayColor: 'rgba(7, 17, 31, 0.72)',
    stagePadding: 6,
    stageRadius: 8,
    nextBtnText: 'Ver o Bolão',
    doneBtnText: 'Ver o Bolão',
    prevBtnText: 'Voltar',
};

type TourUser = {
    roles?: string[];
    permissions?: string[];
    preferences?: { tours?: Record<string, string> } | null;
};

function isDashboardUrl(url: string): boolean {
    const path = url.split(/[?#]/)[0];

    return path === '/' || path === '/dashboard' || path.startsWith('/dashboard');
}

/**
 * Step 1 of the pool-intro tour, shown on the home screen for album users who
 * have already finished the main-menu tour. It spotlights the new "Bolão Copa"
 * menu item — announcing that the old "guess Brazil's score" mission now lives
 * in the pool — and, on advancing, navigates to /pool where the page tour
 * (PageTour tourKey="pool-intro") picks up and continues inside the screen.
 *
 * Mounted in AppShell (inside the sidebar provider) so it can open the mobile
 * drawer to highlight the menu item, mirroring OnboardingTour. If the user
 * dismisses it here instead of continuing, the tour is marked complete so it
 * does not nag on every home visit.
 */
export function PoolIntroHomeStep() {
    const page = usePage<{ auth: { user?: TourUser | null } }>();
    const { isMobile, setOpenMobile, setTourActive } = useSidebar();
    const startedRef = useRef(false);
    const navigatingRef = useRef(false);

    const user = page.props.auth.user;
    const url = page.url;
    const roles = user?.roles ?? [];
    const permissions = user?.permissions ?? [];
    const tours = user?.preferences?.tours ?? {};

    const eligible =
        !!user &&
        !roles.includes('admin') &&
        permissions.includes('pool.predict') &&
        Boolean(tours['main-menu']) &&
        !tours[TOUR_KEY] &&
        isDashboardUrl(url);

    const closeDrawer = useCallback(() => {
        if (isMobile) {
            setOpenMobile(false);
            setTourActive(false);
        }
    }, [isMobile, setOpenMobile, setTourActive]);

    const startStep = useCallback(() => {
        // On mobile the menu is off-canvas: open the drawer (non-modal, so the
        // tour button stays usable) and let it settle before highlighting.
        if (isMobile) {
            setTourActive(true);
            setOpenMobile(true);
        }

        window.setTimeout(
            () => {
                const hasNav = Boolean(document.querySelector(NAV_SELECTOR));

                const instance = driver({
                    ...DRIVER_CONFIG,
                    steps: [
                        {
                            element: hasNav ? NAV_SELECTOR : undefined,
                            popover: {
                                title: 'Novidade: Bolão da Copa! 🇧🇷',
                                description:
                                    'A missão de acertar o placar do Brasil agora é o Bolão da Copa, aqui no menu. Toque em “Ver o Bolão” para palpitar em todos os jogos e ganhar figurinhas pelos acertos.',
                                // Anchor to the right of the item on desktop; let
                                // driver auto-place on the narrow mobile drawer.
                                ...(isMobile || !hasNav ? {} : { side: 'right', align: 'center' }),
                                // Advancing navigates to the pool; the page tour
                                // there continues automatically on arrival.
                                onNextClick: () => {
                                    navigatingRef.current = true;
                                    instance.destroy();
                                    closeDrawer();
                                    router.visit('/pool');
                                },
                            },
                        },
                    ],
                    onDestroyed: () => {
                        // Navigated onward — let the pool tour finish and mark
                        // completion there.
                        if (navigatingRef.current) {
                            return;
                        }

                        // Dismissed on the home screen — don't show it again.
                        closeDrawer();
                        router.post(`/onboarding/tour/${TOUR_KEY}/complete`, {}, { preserveScroll: true, preserveState: true });
                    },
                });
                instance.drive();
            },
            isMobile ? 550 : 120,
        );
    }, [closeDrawer, isMobile, setOpenMobile, setTourActive]);

    useEffect(() => {
        if (!eligible || startedRef.current) {
            return;
        }

        startedRef.current = true;
        const timer = window.setTimeout(startStep, 800);

        return () => window.clearTimeout(timer);
    }, [eligible, startStep]);

    return null;
}
