import { Action } from './index';
import { LoginResponse } from '../../types/login';
import { USER_LOGIN_SUCCESS } from './types';

export function userLoginSuccess(data: LoginResponse): Action<LoginResponse> {
  return {
    type: USER_LOGIN_SUCCESS,
    payload: data
  };
}
