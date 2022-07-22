import request from "../utils/request";
import {PageResult} from "../types/page";
import {Device} from "../types/device";
import {DeleteResponse, GetResponse, PostResponse, PutResponse} from "../utils/response";
import { AlarmRule } from "../types/alarm_rule_template";

export function CheckMacAddressRequest(mac: string) {
    return request.get(`/check/devices/${mac}`).then(GetResponse)
}

export function AddDeviceRequest(device: any) {
    return request.post("/devices", device).then(PostResponse)
}

export function PagingDevicesRequest(page: number, size: number, filters: any) {
    return request.get<PageResult<Device[]>>("/devices", {page, size, ...filters}).then(GetResponse)
}

export function GetDevicesRequest(filters: any) {
    return request.get<Device[]>("/devices", filters).then(GetResponse)
}

export function UpdateDeviceSettingRequest(id: number, setting: any) {
    return request.patch(`/devices/${id}/settings`, setting).then(PutResponse)
}

export function GetDeviceRequest(id: number) {
    return request.get<Device>(`/devices/${id}`).then(GetResponse)
}

export function UpdateDeviceRequest(id: number, device: {name:string; parent:string; network?:number; mac_address?:string;}) {
    return request.put(`/devices/${id}`, device).then(PutResponse)
}

export function DeleteDeviceRequest(id: number) {
    return request.delete(`/devices/${id}`).then(DeleteResponse)
}

export function FindDeviceDataRequest(id: number, from: number, to: number, filters: any) {
    return request.get<any>(`/devices/${id}/data`, {from, to, ...filters}).then(GetResponse)
}

export function GetDeviceDataRequest(id: number, timestamp: number, filters: any) {
    return request.get<any>(`/devices/${id}/data/${timestamp}`, {...filters}).then(GetResponse)
}

export function DownloadDeviceDataRequest(id: number, from: number, to: number, filters: any) {
    return request.download<any>(`/devices/${id}/download/data`, {from, to, ...filters})
}

export function DownloadDeviceDataByTimestampRequest(id: number, timestamp: number, filters: any) {
    return request.download<any>(`/devices/${id}/download/data/${timestamp}`, {...filters})
}

export function RemoveDeviceDataRequest(id: number, from: number, to: number) {
    return request.delete(`/devices/${id}/data?from=${from}&to=${to}`).then(DeleteResponse)
}

export function RemoveLargeDataRequest(id:number, dataType:number, timestamp:number) {
    return request.delete(`/devices/${id}/data/${timestamp}?data_type=${dataType}`).then(DeleteResponse)
}

export function SendDeviceCommandRequest(id: number, cmd: any, params: any) {
    return request.post(`/devices/${id}/commands/${cmd}`, params).then(res => res.data)
}

export function DeviceUpgradeRequest(id: number, params: any) {
    return request.post(`/devices/${id}/upgrade`, params).then(res => res.data)
}

export function DeviceCancelUpgradeRequest(id: number) {
    return request.delete(`/devices/${id}/upgrade`).then(res => res.data)
}

export function GetDeviceSettingRequest(id: number) {
    return request.get<any>(`/devices/${id}/settings`).then(GetResponse)
}

export function GetDefaultDeviceSettingsRequest(type: number) {
    return request.get<any>(`/devices/defaultSettings`, {type}).then(GetResponse)
}

export function GetDeviceRuntimeRequest(id: number, from: number, to: number) {
    return request.get<any>(`/devices/${id}/runtime`, {from, to}).then(GetResponse)
}

export function GetDeviceEventsRequest(id: number, from: number, to: number) {
    return request.get<any>(`/devices/${id}/events`, {from, to}).then(GetResponse)
}

export function PagingDeviceEventsRequest(id: number, from: number, to: number, page: number, size: number) {
    return request.get<PageResult<any[]>>(`/devices/${id}/events`, {from, to, page, size}).then(GetResponse)
}

export function BatchDeleteDeviceEventsRequest(id: number, ids: number[]) {
    return request.delete(`/devices/${id}/events`, {ids}).then(DeleteResponse)
}

export function PagingAlarmRuleDeviceRequest(id: number, page: number, size: number) {
  return request.get<PageResult<AlarmRule[]>>(`/devices/${id}/alarmRules`, { page, size }).then(GetResponse)
}

export function AddAlarmRuleToDeviceRequest(id: number, ids: number[]) {
  return request.post<PageResult<AlarmRule[]>>(`/devices/${id}/alarmRules`, { ids }).then(GetResponse)
}

export function RemoveAlarmRuleFromDeviceRequest(id: number, ids: number[]) {
  return request.delete<PageResult<AlarmRule[]>>(`/devices/${id}/alarmRules`, { ids }).then(GetResponse)
}