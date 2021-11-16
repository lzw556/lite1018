import request from "../utils/request";
import {PageResult} from "../types/page";
import {Device} from "../types/device";
import {PropertyData} from "../types/property_data";
import {DeviceStatistic} from "../types/device_statistic";

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

export function GetPropertyDataRequest(id:number, pid:number, from:number, to:number) {
    return request.get<PropertyData>(`/devices/${id}/property/${pid}/data`, {from, to}).then(res => res.data)
}

export function GetDeviceDataRequest(id:number, from:number, to:number) {
    return request.get<PropertyData[]>(`/devices/${id}/data`, {from, to}).then(res => res.data)
}

export function DownloadDeviceDataRequest(id:number, pid:number, from:number, to:number) {
    return request.download<any>(`/devices/${id}/download/data`, {pid, from, to})
}

export function RemoveDeviceDataRequest(id:number, from:number, to:number) {
    return request.delete(`/devices/${id}/data?from=${from}&to=${to}`).then(res => res.data)
}

export function ReplaceDeviceMacRequest(id:number, mac: string) {
    return request.patch(`/devices/${id}/mac/${mac}`, {}).then(res => res.data)
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

export function GetDeviceGroupByAsset(deviceType: number) {
    return request.get(`/devices/groupBy/asset`, {device_type: deviceType}).then(res => res.data)
}

export function GetChildrenRequest(id:number) {
    return request.get<Device[]>(`/devices/${id}/children`).then(res => res.data)
}

export function GetDeviceSettingRequest(id:number) {
    return request.get(`/devices/${id}/setting`).then(res => res.data)
}

export function GetDevicesStatisticsRequest() {
    return request.get<DeviceStatistic[]>(`/devices/statistics`).then(res => res.data)
}