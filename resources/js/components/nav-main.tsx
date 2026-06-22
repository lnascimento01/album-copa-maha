import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';

// Stable hook target for the onboarding tour, derived from the route, e.g.
// "/album" -> "nav-album", "/checkin-code" -> "nav-checkin-code".
function tourId(href: NavItem['href']): string {
    const segment = toUrl(href).replace(/^\/+/, '').split(/[/?#]/)[0];

    return `nav-${segment || 'dashboard'}`;
}

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const { isMobile, setOpenMobile } = useSidebar();

    // On mobile the menu lives in an off-canvas drawer that did not close when
    // a destination was chosen — close it so the selected page is visible.
    const handleNavigate = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };
    const operationItems = items.filter((item) => {
        const href = toUrl(item.href);

        return ['/dashboard', '/checkins', '/checkin-code', '/reward-code'].some((prefix) => href.startsWith(prefix));
    });
    const collectionItems = items.filter((item) => {
        const href = toUrl(item.href);

        return ['/album', '/packs', '/share-cards'].some((prefix) => href.startsWith(prefix));
    });
    const engagementItems = items.filter((item) => {
        const href = toUrl(item.href);

        return ['/ranking', '/achievements', '/social-missions', '/social-submissions', '/pool'].some((prefix) => href.startsWith(prefix));
    });
    const adminItems = items.filter((item) => toUrl(item.href).startsWith('/admin'));

    const renderItems = (list: NavItem[]) => (
        <SidebarMenu>
            {list.map((item) => (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                        asChild
                        isActive={isCurrentUrl(item.href)}
                        tooltip={{ children: item.title }}
                    >
                        <Link href={item.href} prefetch data-tour={tourId(item.href)} onClick={handleNavigate}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );

    return (
        <>
            {operationItems.length > 0 ? (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Operação</SidebarGroupLabel>
                    {renderItems(operationItems)}
                </SidebarGroup>
            ) : null}

            {collectionItems.length > 0 ? (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Coleção</SidebarGroupLabel>
                    {renderItems(collectionItems)}
                </SidebarGroup>
            ) : null}

            {engagementItems.length > 0 ? (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Engajamento</SidebarGroupLabel>
                    {renderItems(engagementItems)}
                </SidebarGroup>
            ) : null}

            {adminItems.length > 0 ? (
                <SidebarGroup className="px-2 py-1">
                    <SidebarGroupLabel>Administração</SidebarGroupLabel>
                    {renderItems(adminItems)}
                </SidebarGroup>
            ) : null}
        </>
    );
}
