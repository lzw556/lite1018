import {PageResult} from "../types/page";
import {Asset} from "../types/asset";
import request from "../utils/request";
import {AssetStatistic} from "../types/asset_statistic";
import {DeleteResponse, GetResponse, PostResponse, PutResponse} from "../utils/response";

export function PagingAssetsRequest(page:number, size: number) {
    return request.get<PageResult<Asset[]>>("/assets", {page, size}).then(GetResponse)
}

export function AddAssetRequest(name: string) {
    return request.post<any>("/assets", {name}).then(PostResponse)
}

export function GetAssetRequest(id: number) {
    return request.get<Asset>(`/assets/${id}`).then(GetResponse)
}

export function UpdateAssetRequest(id:number, name:string) {
    return request.put<Asset>(`/assets/${id}`, {name}).then(PutResponse)
}

export function RemoveAssetRequest(id: number) {
    return request.delete<any>(`/assets/${id}`).then(DeleteResponse)
}

export function GetAssetStatisticsRequest(id:number) {
    return request.get<AssetStatistic>(`/assets/${id}/statistics`).then(GetResponse)
}

export function GetAllAssetStatisticsRequest() {
    return request.get<AssetStatistic[]>(`/assets/statistics`).then(GetResponse)
}