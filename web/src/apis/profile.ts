import request from '../utils/request';
import { User } from '../types/user';
import { GetResponse, PutResponse } from '../utils/response';

export function GetMyProfile() {
  return request.get<User>('/my/profile').then(GetResponse);
}

export function UpdateMyProfile(params: any) {
  return request.patch<User>('/my/profile', params).then((res) => res.data);
}

export function UpdateMyPass(params: any) {
  return request.patch('/my/pass', params).then(PutResponse);
}
