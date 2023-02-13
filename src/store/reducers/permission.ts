import { State } from './index';
import { Action } from '../actions';
import { SET_PERMISSION } from '../actions/types';
import { CasbinRule } from '../../types/casbin';

export default function setPermission(
  state: State<CasbinRule> = { data: { subject: '', model: '', rules: '' } },
  action: Action<any>
) {
  switch (action.type) {
    case SET_PERMISSION:
      return {
        ...state,
        data: action.payload
      };
    default:
      return state;
  }
}
