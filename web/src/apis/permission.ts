import request from '../utils/request';

export function PagingPermissionsRequest(page: number, size: number) {
  return request.get('/permissions', { page, size }).then((res) => res.data);
}

export function AddPermissionRequest(param: any) {
  return request.post('/permissions', param).then((res) => res.data);
}

export function GetPermissionsWithGroupRequest() {
  return request.get('/permissions/withGroup').then((res) => res.data);
}
