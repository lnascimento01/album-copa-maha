import { route } from './_helpers';

export const enable = route('post', '/user/two-factor-authentication');
export const disable = route('delete', '/user/two-factor-authentication');
export const confirm = route('post', '/user/confirmed-two-factor-authentication');
export const qrCode = route('get', '/user/two-factor-qr-code');
export const secretKey = route('get', '/user/two-factor-secret-key');
export const recoveryCodes = route('get', '/user/two-factor-recovery-codes');
export const regenerateRecoveryCodes = route('post', '/user/two-factor-recovery-codes');
