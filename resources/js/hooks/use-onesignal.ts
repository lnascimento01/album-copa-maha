import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined;

let initialized = false;

export function useOneSignal() {
    const auth = usePage<{ auth: { user: { id: number } | null } }>().props.auth;
    const userId = auth?.user?.id;

    useEffect(() => {
        if (!APP_ID || initialized) return;
        initialized = true;

        OneSignal.init({
            appId: APP_ID,
            serviceWorkerParam: { scope: '/' },
            notifyButton: { enable: false },
            welcomeNotification: { disable: true },
        }).then(() => {
            if (userId) {
                OneSignal.login(String(userId)).catch(() => {});
            }
        }).catch(() => {});
    }, [userId]);
}
