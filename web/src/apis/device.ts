import request from "../utils/request";
import {PageResult} from "../types/page";
import {Device} from "../types/device";
import {DeviceStatistic} from "../types/device_statistic";
import {DeleteResponse, GetResponse, PostResponse, PutResponse} from "../utils/response";
import {WaveData} from "../types/wave_data";

export function CheckMacAddressRequest(mac: string) {
    return request.get(`/check/devices/${mac}`).then(GetResponse)
}

export function AddDeviceRequest(device: any) {
    return request.post("/devices", device).then(PostResponse)
}

export function PagingDevicesRequest(page:number, size: number, filters:any) {
    return request.get<PageResult<Device[]>>("/devices", {page, size, ...filters}).then(GetResponse)
}

export function GetDevicesRequest(filters:any) {
    return request.get<Device[]>("/devices", filters).then(GetResponse)
}

export function UpdateDeviceSettingRequest(id:number, setting:any) {
    return request.patch(`/devices/${id}/settings`, setting).then(PutResponse)
}

export function GetDeviceRequest(id:number) {
    return request.get<Device>(`/devices/${id}`).then(GetResponse)
}

export function UpdateDeviceRequest(id:number, name:string) {
    return request.put(`/devices/${id}`, {name}).then(PutResponse)
}

export function DeleteDeviceRequest(id:number) {
    return request.delete(`/devices/${id}`).then(DeleteResponse)
}

export function FindDeviceDataRequest(id:number, from:number, to:number, filters:any) {
    return request.get<any>(`/devices/${id}/data`, {from, to, ...filters}).then(GetResponse)
}

export function GetDeviceDataRequest(id:number, timestamp:number, filters:any) {
    return request.get<any>(`/devices/${id}/data/${timestamp}`, {...filters}).then(GetResponse)
}

export function DownloadDeviceDataRequest(id:number, from:number, to:number, filters:any) {
    return request.download<any>(`/devices/${id}/download/data`, {from, to, ...filters})
}

export function DownloadDeviceDataByTimestampRequest(id:number, timestamp:number, filters:any) {
    return request.download<any>(`/devices/${id}/download/data/${timestamp}`, {...filters})
}

export function RemoveDeviceDataRequest(id:number, from:number, to:number) {
    return request.delete(`/devices/${id}/data?from=${from}&to=${to}`).then(DeleteResponse)
}

export function SendDeviceCommandRequest(id:number, cmd:any) {
    return request.post(`/devices/${id}/commands/${cmd}`, {}).then(res => res.data)
}

export function DeviceUpgradeRequest(id:number, params:any) {
    return request.post(`/devices/${id}/upgrade`, params).then(res => res.data)
}

export function DeviceCancelUpgradeRequest(id:number) {
    return request.delete(`/devices/${id}/upgrade`).then(res => res.data)
}

export function GetDeviceSettingRequest(id:number) {
    return request.get<any>(`/devices/${id}/settings`).then(GetResponse)
}

export function GetDefaultDeviceSettingsRequest(type: number) {
    return request.get<any>(`/devices/defaultSettings`, {type}).then(GetResponse)
}

export function GetDeviceRuntimeRequest(id:number, from:number, to:number) {
    return request.get<any>(`/devices/${id}/runtime`, {from, to}).then(GetResponse)
}