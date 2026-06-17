import { router, usePage } from '@inertiajs/react';
import { driver } from 'driver.js';
import type { Config, DriveStep } from 'driver.js';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import 'driver.js/dist/driver.css';
import { useSidebar } from '@/components/ui/sidebar';

const TOUR_KEY = 'main-menu';

// Event used by the "Rever tour" entry in the user menu to replay the tour.
export const ONBOARDING_START_EVENT = 'onboarding:start';

type TourItem = {
    permission?: string;
    tourId: string;
    title: string;
    description: string;
};

// Mirrors the album-user items in app-sidebar.tsx (same permission gating),
// ordered to match their visual top-to-bottom order in the sidebar so the
// desktop spotlight moves smoothly down the menu.
const MENU_ITEMS: TourItem[] = [
    { tourId: 'nav-dashboard', title: 'Dashboard', description: 'Sua tela inicial: um resumo do seu progresso, atividades e atalhos rápidos.' },
    { permission: 'activityCheckins.viewOwn', tourId: 'nav-checkins', title: 'Meus Check-ins', description: 'O histórico das suas presenças confirmadas nas atividades.' },
    { permission: 'activityCheckins.selfCreate', tourId: 'nav-checkin-code', title: 'Check-in por Código', description: 'Marque presença numa atividade digitando o código que o organizador mostrar.' },
    { permission: 'rewardCodes.redeemOwn', tourId: 'nav-reward-code', title: 'Resgatar Código', description: 'Resgate códigos promocionais para ganhar pacotes e recompensas.' },
    { permission: 'albumCollection.viewOwn', tourId: 'nav-album', title: 'Álbum', description: 'Aqui você folheia seu álbum, vê as figurinhas que já colou e descobre quais faltam.' },
    { permission: 'stickerPacks.viewOwn', tourId: 'nav-packs', title: 'Meus Pacotes', description: 'Seus pacotes para abrir — toque para viver a animação de revelação das figurinhas.' },
    { permission: 'shareCards.viewOwn', tourId: 'nav-share-cards', title: 'Meus Cards', description: 'Os cards compartilháveis que você gera para postar nas redes.' },
    { permission: 'socialMissionSubmissions.createOwn', tourId: 'nav-social-missions', title: 'Missões', description: 'Missões sociais para participar e ganhar recompensas — envie sua participação por aqui.' },
    { permission: 'socialMissionSubmissions.viewOwn', tourId: 'nav-social-submissions', title: 'Minhas Submissões', description: 'Acompanhe o status das missões que você enviou (em análise, aprovada, etc.).' },
    { permission: 'rankings.view', tourId: 'nav-ranking', title: 'Ranking', description: 'Veja a sua posição e a dos outros participantes na temporada.' },
    { permission: 'achievements.viewOwn', tourId: 'nav-achievements', title: 'Conquistas', description: 'As medalhas e conquistas que você desbloqueia ao longo da coleção.' },
];

type TourUser = {
    roles?: string[];
    permissions?: string[];
    preferences?: { tours?: Record<string, string> } | null;
};

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

/**
 * Onboarding coachmark tour over the main menu, for non-admin album users.
 * Auto-starts once (until completed/skipped, persisted in the DB) and can be
 * replayed from the user menu. Mounted inside the sidebar provider so it can
 * read the mobile/desktop state.
 *
 * Desktop spotlights the real sidebar items. Mobile uses centered cards (the
 * menu lives inside an off-canvas Radix sheet, which does not play well with
 * an overlay tour), plus a spotlight on the ☰ trigger so users know where the
 * menu is.
 */
export function OnboardingTour() {
    const page = usePage<{ auth: { user?: TourUser | null } }>();
    const { isMobile, setOpenMobile } = useSidebar();
    const startedRef = useRef(false);

    const user = page.props.auth.user;
    const roles = user?.roles ?? [];
    const permissions = useMemo(() => user?.permissions ?? [], [user]);
    const isAlbumUser = !!user && !roles.includes('admin') && permissions.includes('albumCollection.viewOwn');
    const completed = Boolean(user?.preferences?.tours?.[TOUR_KEY]);

    const buildSteps = useCallback((): DriveStep[] => {
        const items = MENU_ITEMS.filter((item) => !item.permission || permissions.includes(item.permission));
        const steps: DriveStep[] = [
            {
                popover: {
                    title: 'Bem-vindo ao Álbum da Copa AAPH! 👋',
                    description: 'Vamos dar um tour rápido pelo menu pra você saber onde fica cada coisa. Leva menos de um minuto.',
                },
            },
        ];

        if (isMobile) {
            steps.push({
                element: '[data-tour="menu-trigger"]',
                popover: {
                    title: 'Seu menu',
                    description: 'Toque no ☰ a qualquer momento para abrir o menu de navegação.',
                    side: 'bottom',
                    align: 'start',
                },
            });

            for (const item of items) {
                steps.push({ popover: { title: item.title, description: item.description } });
            }
        } else {
            for (const item of items) {
                const selector = `[data-tour="${item.tourId}"]`;
                steps.push(
                    document.querySelector(selector)
                        ? { element: selector, popover: { title: item.title, description: item.description, side: 'right', align: 'center' } }
                        : { popover: { title: item.title, description: item.description } },
                );
            }
        }

        steps.push({
            popover: {
                title: 'Tudo pronto! 🎉',
                description: 'Você pode rever este tour quando quiser pelo menu do seu perfil, em “Rever tour”. Bom jogo!',
            },
        });

        return steps;
    }, [isMobile, permissions]);

    const startTour = useCallback(() => {
        // On mobile close the drawer first, so the centered cards and the ☰
        // spotlight are not covered by the modal sheet.
        if (isMobile) {
            setOpenMobile(false);
        }

        window.setTimeout(
            () => {
                const instance = driver({
                    ...DRIVER_CONFIG,
                    steps: buildSteps(),
                    onDestroyed: () => {
                        router.post(`/onboarding/tour/${TOUR_KEY}/complete`, {}, { preserveScroll: true, preserveState: true });
                    },
                });
                instance.drive();
            },
            isMobile ? 350 : 120,
        );
    }, [buildSteps, isMobile, setOpenMobile]);

    // Auto-start once for eligible users who have not completed it yet.
    useEffect(() => {
        if (!isAlbumUser || completed || startedRef.current) {
            return;
        }

        startedRef.current = true;
        const timer = window.setTimeout(startTour, 800);

        return () => window.clearTimeout(timer);
    }, [isAlbumUser, completed, startTour]);

    // Manual replay from the user menu.
    useEffect(() => {
        const handler = () => startTour();
        window.addEventListener(ONBOARDING_START_EVENT, handler);

        return () => window.removeEventListener(ONBOARDING_START_EVENT, handler);
    }, [startTour]);

    return null;
}
