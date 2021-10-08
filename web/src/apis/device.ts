import request from "../utils/request";
import {PageResult} from "../types/page";
import {Device} from "../types/device";
import {PropertyData} from "../types/property_data";

export function CheckMacAddressRequest(mac: string) {
    return request.get(`/devices/checkMacAddress/${mac}`).then(res => res.data)
}

export function AddDeviceRequest(device: any) {
    return request.post("/devices", device).then(res => res.data)
}

export function PagingDevicesRequest(assetId:number, page:number, size: number, search:any) {
    return request.get<PageResult<Device[]>>("/devices", {assetId, page, size, search}).then(res => res.data)
}

export function UpdateDeviceSettingRequest(id:number, setting:any) {
    return request.patch(`/devices/${id}/setting`, setting).then(res => res.data)
}

export function GetDeviceRequest(id:number) {
    return request.get<Device>(`/devices/${id}`).then(res => res.data)
}

export function UpdateDeviceRequest(id:number, name:string) {
    return request.put(`/devices/${id}`, {name}).then(res => res.data)
}

export function DeleteDeviceRequest(id:number) {
    return request.delete(`/devices/${id}`).then(res => res.data)
}

export function GetDeviceDataRequest(id:number, pid:number, from:number, to:number) {
    return request.get<PropertyData>(`/devices/${id}/data`, {pid, from, to}).then(res => res.data)
}

export function DownloadDeviceDataRequest(id:number, pid:number, from:number, to:number) {
    return request.download<any>(`/devices/${id}/download/data`, {pid, from, to})
}

export function ReplaceDeviceMacRequest(id:number, mac: string) {
    return request.patch(`/devices/${id}/mac/${mac}`, {}).then(res => res.data)
}

export function SendDeviceCommandRequest(id:number, cmd:any) {
    return request.post(`/devices/${id}/commands/${cmd}`, {}).then(res => res.data)
}