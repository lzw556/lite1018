import { SET_PROJECT } from './types';
import { Action } from './index';

export function setProject(data: number): Action<number> {
  return {
    type: SET_PROJECT,
    payload: data
  };
}
