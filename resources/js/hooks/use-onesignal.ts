import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';

const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined;

let initialized = false;
let initPromise: Promise<void> | null = null;

// 'ios-pwa-required' = iOS browser (not standalone PWA) — push not available
export type PushPermission = 'loading' | 'granted' | 'denied' | 'default' | 'ios-pwa-required';

function isIosBrowser(): boolean {
    if (typeof navigator === 'undefined') return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
    );
}

// Use the native Notification API as the source of truth for permission state.
// OneSignal.Notifications.permissionNative can be stale after the user clears
// site permissions in the browser — the native API always reflects reality.
function nativePerm(): PushPermission {
    if (typeof Notification === 'undefined') return 'default';
    const p = Notification.permission;
    return p === 'granted' ? 'granted' : p === 'denied' ? 'denied' : 'default';
}

export function useOneSignal(): { permissionStatus: PushPermission } {
    const auth = usePage<{ auth: { user: { id: number } | null } }>().props.auth;
    const userId = auth?.user?.id;

    const [permissionStatus, setPermissionStatus] = useState<PushPermission>(
        APP_ID ? 'loading' : 'granted',
    );

    useEffect(() => {
        if (!APP_ID) return;

        // iOS browsers (Safari, Chrome, Firefox — all use WebKit) only support
        // push notifications when the site is installed as a PWA (Add to Home
        // Screen). In a regular browser tab the Notification API exists on
        // iOS 16.4+ but requestPermission() always fails silently.
        if (isIosBrowser() && !isStandalone()) {
            setPermissionStatus('ios-pwa-required');
            return;
        }

        // Browsers without push support (very old / exotic).
        if (typeof Notification === 'undefined' || !('PushManager' in window)) {
            setPermissionStatus('granted'); // hide banner silently
            return;
        }

        let cancelled = false;
        let removeListener: (() => void) | null = null;

        (async () => {
            try {
                if (!initialized) {
                    initialized = true;
                    initPromise = OneSignal.init({
                        appId: APP_ID,
                        serviceWorkerParam: { scope: '/' },
                        notifyButton: { enable: false },
                        welcomeNotification: { disable: true },
                        promptOptions: {
                            slidedown: {
                                prompts: [{
                                    type: 'push',
                                    autoPrompt: false,
                                    delay: {},
                                    text: {
                                        actionMessage: 'Receba notificações sobre missões, figurinhas e novidades do Álbum AAPH!',
                                        acceptButton: 'Ativar',
                                        cancelButton: 'Agora não',
                                    },
                                }],
                            },
                        },
                    });
                }

                await initPromise;
                if (cancelled) return;

                if (userId) {
                    OneSignal.login(String(userId)).catch(() => {});
                }

                // Read from the native API — not OneSignal's internal cache —
                // so that clearing site permissions in the browser is reflected
                // immediately without needing a page reload.
                if (!cancelled) setPermissionStatus(nativePerm());

                const onPermChange = (granted: boolean) => {
                    setPermissionStatus(granted ? 'granted' : 'denied');
                };
                OneSignal.Notifications.addEventListener('permissionChange', onPermChange);
                removeListener = () => OneSignal.Notifications.removeEventListener('permissionChange', onPermChange);
            } catch {
                if (!cancelled) setPermissionStatus('granted');
            }
        })();

        return () => {
            cancelled = true;
            removeListener?.();
        };
    }, [userId]);

    return { permissionStatus };
}
