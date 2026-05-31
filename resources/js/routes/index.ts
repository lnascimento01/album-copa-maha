import { route } from './_helpers';

export const home = route('get', '/');
export const dashboard = route('get', '/dashboard');
export const login = route('get', '/login');
export const register = route('get', '/register');
export const logout = route('post', '/logout');
