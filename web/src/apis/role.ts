import request from '../utils/request';
import { PageResult } from '../types/page';
import { Role } from '../types/role';
import { DeleteResponse, GetResponse, PostResponse, PutResponse } from '../utils/response';

export function PagingRolesRequest(page: number, size: number) {
  return request.get<PageResult<Role[]>>('/roles', { page, size }).then(GetResponse);
}

export function AddRoleRequest(param: any) {
  return request.post('/roles', param).then(PostResponse);
}

export function UpdateRoleRequest(id: number, param: any) {
  return request.put(`/roles/${id}`, param).then(PutResponse);
}

export function GetRoleRequest(id: number) {
  return request.get<Role>(`/roles/${id}`).then(GetResponse);
}

export function AllocMenusRequest(id: number, ids: number[]) {
  return request.patch(`/roles/${id}/menus`, { ids }).then(PutResponse);
}

export function AllocPermissionsRequest(id: number, ids: number[]) {
  return request.patch(`/roles/${id}/permissions`, { ids }).then(PutResponse);
}

export function GetCasbinRequest() {
  return request.get<any>(`/my/casbin`).then(GetResponse);
}

export function RemoveRoleRequest(id: number) {
  return request.delete(`/roles/${id}`).then(DeleteResponse);
}
