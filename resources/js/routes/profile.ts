import { route } from './_helpers';

export const edit = route('get', '/settings/profile');
export const update = route('patch', '/settings/profile');
export const destroy = route('delete', '/settings/profile');

export default {
    edit,
    update,
    destroy,
};
