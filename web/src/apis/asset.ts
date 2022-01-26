import {PageResult} from "../types/page";
import {Asset} from "../types/asset";
import request from "../utils/request";
import {AssetStatistic} from "../types/asset_statistic";
import {DeleteResponse, GetResponse, PostResponse, PutResponse} from "../utils/response";

export function PagingAssetsRequest(page:number, size: number) {
    return request.get<PageResult<Asset[]>>("/assets?method=paging", {page, size}).then(GetResponse)
}

export function AddAssetRequest(formData: any) {
    return request.upload<any>("/assets", formData).then(PostResponse)
}

export function GetAssetRequest(id: number) {
    return request.get<Asset>(`/assets/${id}`).then(GetResponse)
}

export function UpdateAssetRequest(id:number, params:any) {
    return request.upload<Asset>(`/assets/${id}`, params).then(PutResponse)
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

export function GetAssetsRequest() {
    return request.get<Asset[]>(`/assets`).then(GetResponse)
}

export function GetAssetChildrenRequest(id:number) {
    return request.get<Asset[]>(`/assets/${id}/children`).then(GetResponse)
}