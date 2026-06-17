import { Link, router } from '@inertiajs/react';
import { Compass, LogOut, Settings } from 'lucide-react';
import { ONBOARDING_START_EVENT } from '@/components/onboarding-tour';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();

    const roles = (user.roles as string[] | undefined) ?? [];
    const permissions = (user.permissions as string[] | undefined) ?? [];
    // Same eligibility as the auto tour: non-admin album users only.
    const canReplayTour = !roles.includes('admin') && permissions.includes('albumCollection.viewOwn');

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    const handleReplayTour = () => {
        cleanup();
        window.dispatchEvent(new CustomEvent(ONBOARDING_START_EVENT));
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
                {canReplayTour && (
                    <DropdownMenuItem className="cursor-pointer" onClick={handleReplayTour}>
                        <Compass className="mr-2" />
                        Rever tour
                    </DropdownMenuItem>
                )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
