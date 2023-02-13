import { Action } from './index';
import { GET_MENUS_SUCCESS } from './types';

export function setMenusAction(data: any): Action<any> {
  return {
    type: GET_MENUS_SUCCESS,
    payload: data
  };
}
