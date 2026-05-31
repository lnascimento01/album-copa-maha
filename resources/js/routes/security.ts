import { route } from './_helpers';

export const edit = route('get', '/settings/security');
export const update = route('put', '/settings/password');

export default {
    edit,
    update,
};
