import request from "../utils/request";
import {System} from "../types/system";

export function GetSystemRequest() {
    return request.get<System>("/system").then(res => res.data)
}

export function RebootSystemRequest() {
    return request.post("/system/reboot", null).then(res => res.data)
}