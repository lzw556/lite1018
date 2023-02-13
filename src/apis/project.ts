import request from '../utils/request';
import { DeleteResponse, GetResponse, PostResponse, PutResponse } from '../utils/response';
import { PageResult } from '../types/page';
import { Project } from '../types/project';
import { AllocUser } from '../types/alloc_user';

export function PagingProjectsRequest(page: number, size: number) {
  return request.get<PageResult<Project[]>>('/projects', { page, size }).then(GetResponse);
}

export function GetProjectsRequest() {
  return request.get<Project[]>('/projects').then(GetResponse);
}

export function CreateProjectRequest(params: any) {
  return request.post<any>('/projects', params).then(PostResponse);
}

export function UpdateProjectRequest(id: number, params: any) {
  return request.put<any>(`/projects/${id}`, params).then(PutResponse);
}

export function GetAllocUsersRequest(id: number) {
  return request.get<AllocUser[]>(`/projects/${id}/users`).then(GetResponse);
}

export function AllocUsersRequest(id: number, params: any) {
  return request.patch<any>(`/projects/${id}/users`, params).then(PutResponse);
}

export function GetMyProjectsRequest() {
  return request.get<Project[]>('/my/projects').then(GetResponse);
}

export function GetMyProjectRequest(id: number) {
  return request.get<Project>(`/my/projects/${id}`).then(GetResponse);
}

export function DeleteProjectRequest(id: number) {
  return request.delete(`/projects/${id}`, null).then(DeleteResponse);
}

export function GetProjectRequest(id: number) {
  return request.get<Project>(`/projects/${id}`).then(GetResponse);
}

export function GenProjectAccessTokenRequest(id: number) {
  return request.post<any>(`/projects/${id}/token`, null).then(PostResponse);
}
