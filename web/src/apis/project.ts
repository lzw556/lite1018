import request from "../utils/request";
import {GetResponse, PostResponse, PutResponse} from "../utils/response";
import {PageResult} from "../types/page";
import {Project} from "../types/project";
import {AllocUser} from "../types/alloc_user";

export function PagingProjectsRequest(page: number, size: number) {
    return request.get<PageResult<Project[]>>('/projects?method=paging', {page, size}).then(GetResponse)
}

export function CreateProjectRequest(params: any) {
    return request.post<any>('/projects', params).then(PostResponse)
}

export function UpdateProjectRequest(id: number, params: any) {
    return request.put<any>(`/projects/${id}`, params).then(PutResponse)
}

export function GetAllocUsersRequest(id: number) {
    return request.get<AllocUser[]>(`/projects/${id}/users`).then(GetResponse)
}

export function AllocUsersRequest(id: number, params: any) {
    return request.patch<any>(`/projects/${id}/users`, params).then(PutResponse)
}

export function GetMyProjectsRequest() {
    return request.get<Project[]>('/my/projects').then(GetResponse)
}