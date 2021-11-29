import request from "../utils/request";
import {Menu} from "../types/menu";

export function GetMyMenusRequest() {
    return request.get<Menu[]>("/my/menus").then(res => res.data)
}

export function GetMenusTreeRequest() {
    return request.get<Menu[]>("/menus/tree").then(res => res.data)
}