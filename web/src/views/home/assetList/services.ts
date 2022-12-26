import { ProjectStatistics } from '..';
import request from '../../../utils/request';
import { DeleteResponse, GetResponse, PostResponse, PutResponse } from '../../../utils/response';
import { HistoryData } from '../common/historyDataHelper';
import { Asset, AssetRow } from './props';

export function getAssets(filters?: Partial<Pick<Asset, 'type' | 'parent_id'>>) {
  return request.get<AssetRow[]>(`/assets`, { ...filters }).then(GetResponse);
}

export function getAsset(id: number) {
  return request.get<AssetRow>(`/assets/${id}`).then(GetResponse);
}

export function addAsset(asset: Asset) {
  return request.post('/assets', asset).then(PostResponse);
}

export function updateAsset(id: Asset['id'], asset: Asset) {
  return request.put(`/assets/${id}`, asset).then(PutResponse);
}

export function deleteAsset(id: Asset['id']) {
  return request.delete(`/assets/${id}`).then(DeleteResponse);
}

export function getProjectStatistics() {
  return request.get<ProjectStatistics>(`/statistics/all`).then(GetResponse);
}

export function exportAssets(projectId: number, asset_ids?: number[]) {
  if (asset_ids && asset_ids.length > 0) {
    return request.download<any>(
      `my/projects/${projectId}/exportFile?asset_ids=${asset_ids.join(',')}`
    );
  } else {
    return request.download<any>(`my/projects/${projectId}/exportFile`);
  }
}

export function importAssets(id: number, data: any) {
  return request.post<any>(`my/projects/${id}/import`, data);
}

export function getData(id: AssetRow['id'], from: number, to: number) {
  return request
    .get<{ timestamp: number }[]>(`/assets/${id}/data?from=${from}&to=${to}`)
    .then(GetResponse);
}

export function getFlangeData(id: AssetRow['id'], timestamp: number) {
  return request.get<HistoryData[0]>(`/assets/${id}/data/${timestamp}`).then(GetResponse);
}
