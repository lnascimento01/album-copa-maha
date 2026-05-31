import { route } from '@/routes/_helpers';

export const index = route('get', '/passkeys/confirm');
export const store = route('post', '/passkeys/confirm');
