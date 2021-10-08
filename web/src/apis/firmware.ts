import request from "../utils/request";
import {Firmware} from "../types/firmware";

export function PagingFirmwaresRequest(page:number, size:number) {
    return request.get<Firmware[]>("/firmwares", {page, size}).then(res => res.data)
}

export function RemoveFirmwareRequest(id:number) {
    return request.delete(`/firmwares/${id}`).then(res => res.data)
}