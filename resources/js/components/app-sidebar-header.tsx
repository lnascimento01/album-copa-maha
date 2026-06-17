import { Breadcrumbs } from '@/components/breadcrumbs';
import ThemeToggle from '@/components/theme-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-[color:var(--topbar-bg)] px-6 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="-ml-1" data-tour="menu-trigger" />
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-[0.12em] text-dim uppercase">Temporada Copa AAPH</p>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <ThemeToggle compact />
        </header>
    );
}
