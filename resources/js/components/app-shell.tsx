import { usePage } from '@inertiajs/react';
import { createContext, useContext, type ReactNode } from 'react';
import { OnboardingTour } from '@/components/onboarding-tour';
import { PoolIntroHomeStep } from '@/components/pool-intro-home-step';
import { useOneSignal, type PushPermission } from '@/hooks/use-onesignal';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { AppVariant } from '@/types';

const PushPermissionContext = createContext<PushPermission>('loading');

export function usePushPermission(): PushPermission {
    return useContext(PushPermissionContext);
}

type Props = {
    children: ReactNode;
    variant?: AppVariant;
};

export function AppShell({ children, variant = 'sidebar' }: Props) {
    const isOpen = usePage().props.sidebarOpen;
    const { permissionStatus } = useOneSignal();

    if (variant === 'header') {
        return (
            <PushPermissionContext.Provider value={permissionStatus}>
                <div className="flex min-h-screen w-full flex-col">{children}</div>
            </PushPermissionContext.Provider>
        );
    }

    return (
        <PushPermissionContext.Provider value={permissionStatus}>
            <SidebarProvider defaultOpen={isOpen}>
                {children}
                <OnboardingTour />
                <PoolIntroHomeStep />
            </SidebarProvider>
        </PushPermissionContext.Provider>
    );
}
