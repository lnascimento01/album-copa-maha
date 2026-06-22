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

// Environment-derived initial status, computed during render. Doing this here
// (instead of calling setState synchronously inside the effect) avoids the
// react-hooks/set-state-in-effect lint error and is the recommended pattern for
// state that derives from the environment rather than from an external system.
function computeInitialStatus(): PushPermission {
    if (!APP_ID) return 'granted';
    // iOS browsers (all WebKit) only support push when installed as a PWA.
    if (isIosBrowser() && !isStandalone()) return 'ios-pwa-required';
    // Browsers without push support (very old / exotic) — hide banner silently.
    if (typeof Notification === 'undefined' || !('PushManager' in window)) return 'granted';
    return 'loading';
}

export function useOneSignal(): { permissionStatus: PushPermission } {
    const auth = usePage<{ auth: { user: { id: number } | null } }>().props.auth;
    const userId = auth?.user?.id;

    const [permissionStatus, setPermissionStatus] = useState<PushPermission>(computeInitialStatus);

    useEffect(() => {
        if (!APP_ID) return;

        // iOS-not-PWA and browsers without push support are already reflected by
        // the initial state computed during render — just stop here (no
        // synchronous setState inside the effect body).
        if (isIosBrowser() && !isStandalone()) return;
        if (typeof Notification === 'undefined' || !('PushManager' in window)) return;

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

                // Tie every push subscription to the app user id — OneSignal
                // stores it as `external_id`, which is how the backend targets
                // sends (include_aliases.external_id). This MUST be re-asserted
                // when the subscription is actually created/changed: calling
                // login() only once at init races with the opt-in, so a user
                // who enables push before login() settles ends up as an
                // ANONYMOUS subscription that no user-targeted send can reach.
                const identify = () => {
                    if (userId) {
                        OneSignal.login(String(userId)).catch(() => {});
                    }
                };

                // Rescue users who already granted permission but whose
                // OneSignal subscription was never created or was left
                // anonymous. The banner is hidden once permission is 'granted',
                // so this silent re-opt-in is their ONLY way out of limbo —
                // without it they keep granted permission but never receive.
                // optIn() does NOT prompt when permission is already granted and
                // is a no-op when already subscribed, so it is safe every load.
                if (nativePerm() === 'granted') {
                    try {
                        await OneSignal.User.PushSubscription.optIn();
                    } catch {
                        // older SDK / transient — identify() below still runs
                    }
                    if (cancelled) return;
                }

                identify();

                // Read from the native API — not OneSignal's internal cache —
                // so that clearing site permissions in the browser is reflected
                // immediately without needing a page reload.
                if (!cancelled) setPermissionStatus(nativePerm());

                const onPermChange = (granted: boolean) => {
                    setPermissionStatus(granted ? 'granted' : 'denied');
                    // The subscription is created the moment permission is
                    // granted — re-assert the external_id right then.
                    if (granted) {
                        identify();
                    }
                };
                OneSignal.Notifications.addEventListener('permissionChange', onPermChange);

                // Also re-identify whenever the push subscription itself changes
                // (e.g. a brand-new subscription id is assigned), covering the
                // case where login() at init ran before the subscription loaded.
                let removeSubListener: (() => void) | null = null;
                try {
                    const onSubChange = () => identify();
                    OneSignal.User.PushSubscription.addEventListener('change', onSubChange);
                    removeSubListener = () => OneSignal.User.PushSubscription.removeEventListener('change', onSubChange);
                } catch {
                    // Older SDK without PushSubscription change events — the
                    // permissionChange handler above still re-identifies on opt-in.
                }

                removeListener = () => {
                    OneSignal.Notifications.removeEventListener('permissionChange', onPermChange);
                    removeSubListener?.();
                };
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
