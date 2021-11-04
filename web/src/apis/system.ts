import request from "../utils/request";

export function GetSystemRequest() {
    return request.get("/system/checkInit").then(res => res.data)
}

export function InitSystemRequest(params:any) {
    return request.post("/system/init", params).then(res => res.data)
}