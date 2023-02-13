import { store } from '../store';
import { Menu } from '../types/menu';

export const isLogin = (): boolean => {
  return store.getState().auth.data.token;
};

export const getToken = (): string => {
  return store.getState().auth.data.token;
};

export const getMenus = (): Menu[] => {
  return store.getState().menu.data;
};

export const getProject = () => {
  return store.getState().project.data;
};

export const getPermission = () => {
  return store.getState().permission.data;
};
