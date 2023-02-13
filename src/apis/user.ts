import request from '../utils/request';
import { PageResult } from '../types/page';
import { User } from '../types/user';
import { LoginResponse } from '../types/login';
import { DeleteResponse, GetResponse, PostResponse, PutResponse } from '../utils/response';

export function PagingUsersRequest(page: number, size: number) {
  return request.get<PageResult<User[]>>('/users', { page, size }).then(GetResponse);
}

export function AddUserRequest(user: any) {
  return request.post<any>('/users', user).then(PostResponse);
}

export function RemoveUserRequest(id: number) {
  return request.delete<any>(`/users/${id}`).then(DeleteResponse);
}

export function GetUserRequest(id: number) {
  return request.get<User>(`/users/${id}`).then(GetResponse);
}

export function UpdateUserRequest(id: number, user: any) {
  return request.put<User>(`/users/${id}`, user).then(PutResponse);
}

export function LoginRequest(username: string, password: string) {
  return request.post<LoginResponse>('/login', { username, password }).then((res) => res.data);
}
