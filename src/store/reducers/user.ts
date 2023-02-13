import { USER_LOGIN_SUCCESS } from '../actions/types';
import { Action } from '../actions';
import { LoginResponse } from '../../types/login';
import { State } from './index';

export default function userLogin(
  state: State<LoginResponse> = { data: { username: '' } },
  action: Action<LoginResponse>
) {
  switch (action.type) {
    case USER_LOGIN_SUCCESS:
      return {
        ...state,
        data: action.payload
      };
    default:
      return state;
  }
}
