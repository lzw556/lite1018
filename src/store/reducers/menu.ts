import { Action } from '../actions';
import { State } from './index';
import { GET_MENUS_SUCCESS } from '../actions/types';
import { Menu } from '../../types/menu';

export default function getMenus(state: State<Menu[]> = { data: [] }, action: Action<Menu[]>) {
  switch (action.type) {
    case GET_MENUS_SUCCESS:
      return {
        ...state,
        data: action.payload
      };
    default:
      return state;
  }
}
