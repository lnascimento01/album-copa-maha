import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';

const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined;

let initialized = false;
let initPromise: Promise<void> | null = null;

export type PushPermission = 'loading' | 'granted' | 'denied' | 'default';

export function useOneSignal(): { permissionStatus: PushPermission } {
    const auth = usePage<{ auth: { user: { id: number } | null } }>().props.auth;
    const userId = auth?.user?.id;

    // When APP_ID is absent stay 'default' so no banner ever shows.
    const [permissionStatus, setPermissionStatus] = useState<PushPermission>(
        APP_ID ? 'loading' : 'default',
    );

    useEffect(() => {
        if (!APP_ID) return;

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
                    });
                }

                await initPromise;
                if (cancelled) return;

                if (userId) {
                    OneSignal.login(String(userId)).catch(() => {});
                }

                const native = OneSignal.Notifications.permissionNative;

                if (native === 'default') {
                    await OneSignal.Notifications.requestPermission().catch(() => {});
                    const afterNative = OneSignal.Notifications.permissionNative;
                    if (!cancelled) {
                        setPermissionStatus(
                            afterNative === 'granted' ? 'granted' :
                            afterNative === 'denied'  ? 'denied'  : 'default',
                        );
                    }
                } else if (!cancelled) {
                    setPermissionStatus(native === 'granted' ? 'granted' : native === 'denied' ? 'denied' : 'default');
                }

                const onPermChange = (granted: boolean) => {
                    setPermissionStatus(granted ? 'granted' : 'denied');
                };
                OneSignal.Notifications.addEventListener('permissionChange', onPermChange);
                removeListener = () => OneSignal.Notifications.removeEventListener('permissionChange', onPermChange);
            } catch {
                if (!cancelled) setPermissionStatus('default');
            }
        })();

        return () => {
            cancelled = true;
            removeListener?.();
        };
    }, [userId]);

    return { permissionStatus };
}
