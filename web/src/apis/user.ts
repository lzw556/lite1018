import request from "../utils/request";
import {PageResult} from "../types/page";
import {User} from "../types/user";
import {LoginResponse} from "../types/login";

export function PagingUsersRequest(page:number, size:number) {
    return request.get<PageResult<User[]>>("/users", {page, size}).then(res => res.data)
}

export function AddUserRequest(user:any) {
    return request.post<any>("/users", user).then(res => res.data)
}

export function RemoveUserRequest(id:number) {
    return request.delete<any>(`/users/${id}`).then(res => res.data)
}

export function GetUserRequest(id:number) {
    return request.get<User>(`/users/${id}`).then(res => res.data)
}

export function UpdateUserRequest(id:number, user:any) {
    return request.put<User>(`/users/${id}`, {phone:user.phone, email:user.email}).then(res => res.data)
}

export function LoginRequest(username: string, password: string) {
    return request.post<LoginResponse>("/login", {username, password}).then(res => res.data)
}