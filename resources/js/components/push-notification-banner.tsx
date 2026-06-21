import { Bell, X } from 'lucide-react';
import { useState } from 'react';
import OneSignal from 'react-onesignal';
import { usePushPermission } from '@/components/app-shell';

const DISMISS_KEY = 'push-banner-dismissed-v1';

type HintType = 'quiet-mode' | 'denied' | null;

export function PushNotificationBanner() {
    const permissionStatus = usePushPermission();
    const [dismissed, setDismissed] = useState(
        () => typeof window !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1',
    );
    const [hint, setHint] = useState<HintType>(null);

    const shouldShow =
        (permissionStatus === 'default' ||
            permissionStatus === 'denied' ||
            permissionStatus === 'ios-pwa-required') &&
        !dismissed;

    if (!shouldShow) return null;

    // iOS: push only works as an installed PWA — show install instructions instead.
    if (permissionStatus === 'ios-pwa-required') {
        return (
            <div className="flex items-start justify-between gap-3 border-b border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
                <div className="flex min-w-0 items-start gap-2">
                    <Bell className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                        Para receber notificações no iPhone, adicione este app à tela inicial:{' '}
                        toque em{' '}
                        <strong>Compartilhar → Adicionar à Tela de Início</strong>
                        {' '}e abra por lá.
                    </span>
                </div>
                <button
                    onClick={() => { localStorage.setItem(DISMISS_KEY, '1'); setDismissed(true); }}
                    className="mt-0.5 shrink-0 rounded p-0.5 transition-colors hover:bg-blue-200/60 dark:hover:bg-blue-800/60"
                    aria-label="Dispensar"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    const handleEnable = async () => {
        setHint(null);

        // If the native API already says 'denied', there's no point calling
        // requestPermission() — the browser will ignore it. Guide the user
        // straight to settings.
        if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
            setHint('denied');
            return;
        }

        const granted = await OneSignal.Notifications.requestPermission().catch(() => false);

        if (granted) return; // banner will disappear via permissionChange event

        // requestPermission() returned false without the user explicitly denying:
        // Chrome on Android is in "quiet mode" — it shows a small bell icon in
        // the address bar instead of a popup. Guide the user to tap that icon.
        const currentPerm = typeof Notification !== 'undefined' ? Notification.permission : 'default';
        setHint(currentPerm === 'denied' ? 'denied' : 'quiet-mode');
    };

    const handleDismiss = () => {
        localStorage.setItem(DISMISS_KEY, '1');
        setDismissed(true);
    };

    const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

    return (
        <div className="flex flex-col gap-1 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <Bell className="h-4 w-4 shrink-0" />
                    <span className="min-w-0">
                        {permissionStatus === 'denied'
                            ? 'Notificações bloqueadas. Ative para saber quando suas missões forem avaliadas e quando ganhar figurinhas.'
                            : 'Ative as notificações para saber quando suas missões forem avaliadas e quando ganhar figurinhas.'}
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

            {hint === 'quiet-mode' && (
                <p className="pl-6 text-xs text-amber-700 dark:text-amber-300">
                    {isAndroid
                        ? 'O Chrome silenciou o pedido de permissão. Procure o ícone de sino ou cadeado na barra de endereços e toque em "Permitir notificações".'
                        : 'O navegador silenciou o pedido. Clique no ícone de cadeado na barra de endereço e permita notificações para este site.'}
                </p>
            )}

            {hint === 'denied' && (
                <p className="pl-6 text-xs text-amber-700 dark:text-amber-300">
                    {isAndroid
                        ? 'Notificações bloqueadas. Acesse Configurações do Chrome → Configurações do site → Notificações e permita este endereço.'
                        : 'Notificações bloqueadas. Clique no ícone de cadeado na barra de endereço, toque em "Notificações" e escolha "Permitir".'}
                </p>
            )}
        </div>
    );
}
