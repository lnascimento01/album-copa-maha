import { parameterizedRoute, route } from '@/routes/_helpers';

export const destroy = parameterizedRoute<number | string, 'delete'>(
    'delete',
    (passkey) => `/passkeys/${passkey}`,
);

export const store = route('post', '/passkeys');
export const options = route('get', '/passkeys/options');
