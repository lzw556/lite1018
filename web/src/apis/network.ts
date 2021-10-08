import request from "../utils/request";
import {Network} from "../types/network";

export function GetNetworkRequest(id: number) {
    return request.get<Network>(`/networks/${id}`).then(res => res.data)
}

export function GetNetworksRequest(assetId:number) {
    return request.get<Network[]>(`/networks`, {assetId}).then(res => res.data)
}

export function AccessDevicesRequest(networkId:number, parent:number, children:[]) {
    return request.patch(`/networks/${networkId}/devices`, {parent, children}).then(res => res.data)
}

export function RemoveDeviceRequest(networkId:number, deviceId:number) {
    return request.delete<Network>(`/networks/${networkId}/devices/${deviceId}`).then(res => res.data)
}

export function ImportNetworkRequest(params:any) {
    return request.post("/networks", params).then(res => res.data)
}

export function ExportNetworkRequest(id:number) {
    return request.download<any>(`/networks/${id}/export`)
}

export function UpdateNetworkSettingRequest(gatewayId:number, wsn:any) {
    return request.put(`/networks/setting?gatewayId=${gatewayId}`, wsn).then(res => res.data)
}