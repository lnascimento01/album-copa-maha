import { Bell, X } from 'lucide-react';
import { useState } from 'react';
import OneSignal from 'react-onesignal';
import { usePushPermission } from '@/components/app-shell';

const DISMISS_KEY = 'push-banner-dismissed-v1';

export function PushNotificationBanner() {
    const permissionStatus = usePushPermission();
    const [dismissed, setDismissed] = useState(
        () => typeof window !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1',
    );
    const [showHint, setShowHint] = useState(false);

    if (permissionStatus !== 'denied' || dismissed) return null;

    const handleEnable = async () => {
        const granted = await OneSignal.Notifications.requestPermission().catch(() => false);
        if (!granted) setShowHint(true);
    };

    const handleDismiss = () => {
        localStorage.setItem(DISMISS_KEY, '1');
        setDismissed(true);
    };

    return (
        <div className="flex flex-col gap-1 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <Bell className="h-4 w-4 shrink-0" />
                    <span className="min-w-0">
                        Ative as notificações para saber quando suas missões forem avaliadas e quando ganhar figurinhas.
                    </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <button
                        onClick={handleEnable}
                        className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                    >
                        Ativar
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="rounded p-0.5 transition-colors hover:bg-amber-200/60 dark:hover:bg-amber-800/60"
                        aria-label="Dispensar"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
            {showHint && (
                <p className="pl-6 text-xs text-amber-700 dark:text-amber-300">
                    O navegador bloqueou as notificações. Para ativar, clique no ícone de cadeado na barra de
                    endereço e permita notificações para este site.
                </p>
            )}
        </div>
    );
}
