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

    const [permissionStatus, setPermissionStatus] = useState<PushPermission>(
        APP_ID ? 'loading' : 'granted', // 'granted' hides banner when no APP_ID
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

                // Read current permission — never call requestPermission() here.
                // Browsers (Chrome 80+) require a user gesture; calling it from
                // an effect would be silently ignored. The banner button handles it.
                const native = OneSignal.Notifications.permissionNative;
                if (!cancelled) {
                    setPermissionStatus(
                        native === 'granted' ? 'granted' :
                        native === 'denied'  ? 'denied'  : 'default',
                    );
                }

                const onPermChange = (granted: boolean) => {
                    setPermissionStatus(granted ? 'granted' : 'denied');
                };
                OneSignal.Notifications.addEventListener('permissionChange', onPermChange);
                removeListener = () => OneSignal.Notifications.removeEventListener('permissionChange', onPermChange);
            } catch {
                if (!cancelled) setPermissionStatus('granted'); // hide banner on error
            }
        })();

        return () => {
            cancelled = true;
            removeListener?.();
        };
    }, [userId]);

    return { permissionStatus };
}
