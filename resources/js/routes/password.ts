import { route } from './_helpers';

export const request = route('get', '/forgot-password');
export const email = route('post', '/forgot-password');
export const update = route('post', '/reset-password');
