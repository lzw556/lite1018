import request from "../utils/request";
import {Firmware} from "../types/firmware";

export function PagingFirmwaresRequest(page:number, size:number) {
    return request.get<Firmware[]>("/firmwares", {page, size}).then(res => res.data)
}

export function RemoveFirmwareRequest(id:number) {
    return request.delete(`/firmwares/${id}`).then(res => res.data)
}

export function UploadFirmwareRequest(file:any) {
    return request.upload("/firmwares", file).then(res => res.data)
}

export function GetDeviceFirmwaresRequest(id:number) {
    return request.get<Firmware[]>(`/devices/${id}/firmwares`).then(res => res.data)
}