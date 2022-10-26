import { State } from './index';
import { Action } from '../actions';

export default function setProject(state: State<number> = { data: 0 }, action: Action<number>) {
  switch (action.type) {
    case 'SET_PROJECT':
      return {
        ...state,
        data: action.payload
      };
    default:
      return state;
  }
}
