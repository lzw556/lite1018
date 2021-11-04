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

export function RemoveDevicesRequest(networkId:number, params:any) {
    return request.delete(`/networks/${networkId}/devices`, params).then(res => res.data)
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

export function UpdateNetworkRequest(id:number, params:any) {
    return request.put<Network>(`/networks/${id}`, params).then(res => res.data)
}

export function SyncNetworkRequest(id:number) {
    return request.put(`/networks/${id}/sync`, null).then(res => res.data)
}