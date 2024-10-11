import { State } from './index';
import { Action } from '../actions';

type Project = { id: number; name: string };

export default function setProject(
  state: State<Project> = { data: { id: 0, name: '' } },
  action: Action<Project>
) {
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
