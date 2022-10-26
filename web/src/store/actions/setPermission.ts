import { SET_PERMISSION } from './types';
import { Action } from './index';
import { CasbinRule } from '../../types/casbin';

export function setPermission(data: any): Action<CasbinRule> {
  return {
    type: SET_PERMISSION,
    payload: data
  };
}
