import request from "../utils/request";
import {PageResult} from "../types/page";
import {Role} from "../types/role";

export function PagingRolesRequest(page:number, size:number) {
    return request.get<PageResult<Role[]>>("/roles", {page, size}).then(res => res.data)
}

export function AddRoleRequest(param:any) {
    return request.post("/roles", param).then(res => res.data)
}

export function UpdateRoleRequest(id:number, param:any) {
    return request.put(`/roles/${id}`, param).then(res => res.data)
}

export function GetRoleRequest(id:number) {
    return request.get<Role>(`/roles/${id}`).then(res => res.data)
}

export function AllocMenusRequest(id:number, ids:number[]) {
    return request.patch(`/roles/${id}/menus`, {ids}).then(res => res.data)
}

export function AllocPermissionsRequest(id:number, ids:number[]) {
    return request.patch(`/roles/${id}/permissions`, {ids}).then(res => res.data)
}

export function GetCasbinRequest() {
    return request.get<any>(`/my/casbin`).then(res => res.data)
}