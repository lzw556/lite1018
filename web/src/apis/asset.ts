import {PageResult} from "../types/page";
import {Asset} from "../types/asset";
import request from "../utils/request";
import {AssetStatistic} from "../types/asset_statistic";

export function PagingAssetsRequest(page:number, size: number) {
    return request.get<PageResult<Asset[]>>("/assets", {page, size}).then(res => res.data)
}

export function AddAssetRequest(name: string) {
    return request.post<any>("/assets", {name}).then(res => res.data)
}

export function GetAssetRequest(id: number) {
    return request.get<Asset>(`/assets/${id}`).then(res => res.data)
}

export function UpdateAssetRequest(id:number, name:string) {
    return request.put<Asset>(`/assets/${id}`, {name}).then(res => res.data)
}

export function RemoveAssetRequest(id: number) {
    return request.delete(`/assets/${id}`).then(res => res.data)
}

export function GetAssetStatisticsRequest(id:number) {
    return request.get<AssetStatistic>(`/assets/${id}/statistics`).then(res => res.data)
}

export function GetAllAssetStatisticsRequest() {
    return request.get<AssetStatistic[]>(`/assets/statistics`).then(res => res.data)
}