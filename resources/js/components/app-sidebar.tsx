import { Link, usePage } from '@inertiajs/react';
import {
    Album,
    BadgeCheck,
    BarChart3,
    ClipboardCheck,
    Flag,
    LayoutGrid,
    Medal,
    Package,
    ScrollText,
    Shield,
    Sticker,
    Trophy,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

type PageAuth = {
    auth: {
        user?: {
            permissions?: string[];
        };
    };
};

export function AppSidebar() {
    const page = usePage<PageAuth>();
    const permissions = page.props.auth.user?.permissions ?? [];

    const items: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    const pushIf = (condition: boolean, item: NavItem) => {
        if (condition) {
            items.push(item);
        }
    };

    pushIf(permissions.includes('albumCollection.viewOwn'), {
        title: 'Álbum',
        href: '/album',
        icon: Album,
    });

    pushIf(permissions.includes('stickerPacks.viewOwn'), {
        title: 'Meus Pacotes',
        href: '/packs',
        icon: Package,
    });

    pushIf(permissions.includes('activityCheckins.viewOwn'), {
        title: 'Meus Check-ins',
        href: '/checkins',
        icon: ClipboardCheck,
    });

    pushIf(permissions.includes('activityCheckins.selfCreate'), {
        title: 'Check-in por Código',
        href: '/checkin-code',
        icon: ScrollText,
    });

    pushIf(permissions.includes('rewardCodes.redeemOwn'), {
        title: 'Resgatar Código',
        href: '/reward-code',
        icon: Medal,
    });

    pushIf(permissions.includes('socialMissionSubmissions.createOwn'), {
        title: 'Missões',
        href: '/social-missions',
        icon: Trophy,
    });

    pushIf(permissions.includes('socialMissionSubmissions.viewOwn'), {
        title: 'Minhas Submissões',
        href: '/social-submissions',
        icon: Users,
    });

    pushIf(permissions.includes('rankings.view'), {
        title: 'Ranking',
        href: '/ranking',
        icon: BarChart3,
    });

    pushIf(permissions.includes('achievements.viewOwn'), {
        title: 'Conquistas',
        href: '/achievements',
        icon: BadgeCheck,
    });

    pushIf(permissions.includes('shareCards.viewOwn'), {
        title: 'Meus Cards',
        href: '/share-cards',
        icon: Sticker,
    });

    pushIf(permissions.includes('users.viewAny'), {
        title: 'Usuários',
        href: '/admin/users',
        icon: Users,
    });

    pushIf(permissions.includes('teams.viewAny'), {
        title: 'Times',
        href: '/admin/teams',
        icon: Flag,
    });

    pushIf(permissions.includes('albums.viewAny'), {
        title: 'Álbuns',
        href: '/admin/albums',
        icon: Album,
    });

    pushIf(permissions.includes('players.viewAny'), {
        title: 'Jogadores',
        href: '/admin/players',
        icon: Trophy,
    });

    pushIf(permissions.includes('stickers.viewAny'), {
        title: 'Figurinhas',
        href: '/admin/stickers',
        icon: Sticker,
    });

    pushIf(permissions.includes('stickerPacks.viewAny'), {
        title: 'Pacotes (Admin)',
        href: '/admin/sticker-packs',
        icon: Package,
    });

    pushIf(permissions.includes('activities.viewAny'), {
        title: 'Atividades',
        href: '/admin/activities',
        icon: ClipboardCheck,
    });

    pushIf(permissions.includes('rewardCodes.viewAny'), {
        title: 'Códigos',
        href: '/admin/reward-codes',
        icon: Medal,
    });

    pushIf(permissions.includes('socialMissions.viewAny'), {
        title: 'Missões Sociais',
        href: '/admin/social-missions',
        icon: Trophy,
    });

    pushIf(permissions.includes('socialMissionSubmissions.viewAny'), {
        title: 'Fila Social',
        href: '/admin/social-mission-submissions',
        icon: Users,
    });

    pushIf(permissions.includes('rankings.viewAny'), {
        title: 'Ranking (Admin)',
        href: '/admin/rankings',
        icon: BarChart3,
    });

    pushIf(permissions.includes('achievements.viewAny'), {
        title: 'Conquistas (Admin)',
        href: '/admin/achievements',
        icon: BadgeCheck,
    });

    pushIf(permissions.includes('shareCards.viewAny'), {
        title: 'Cards (Admin)',
        href: '/admin/share-cards',
        icon: Sticker,
    });

    pushIf(permissions.includes('roles.viewAny'), {
        title: 'Papéis e Permissões',
        href: '/admin/roles',
        icon: Shield,
    });

    pushIf(permissions.includes('audit.viewAny'), {
        title: 'Auditoria',
        href: '/admin/audit-logs',
        icon: ScrollText,
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={items} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
