import request from '../../utils/request';
import { DeleteResponse, GetResponse, PostResponse, PutResponse } from '../../utils/response';
import { HistoryData } from '.';
import { AssetModel, AssetRow } from './types';

export function getAssets(filters?: Partial<Pick<AssetModel, 'type' | 'parent_id' | 'id'>>) {
  return request.get<AssetRow[]>(`/assets`, { ...filters }).then(GetResponse);
}

export function getAsset(id: number) {
  return request.get<AssetRow>(`/assets/${id}`).then(GetResponse);
}

export function addAsset(asset: AssetModel) {
  return request.post('/assets', asset).then(PostResponse);
}

export function updateAsset(id: AssetModel['id'], asset: AssetModel) {
  return request.put(`/assets/${id}`, asset).then(PutResponse);
}

export function deleteAsset(id: AssetModel['id']) {
  return request.delete(`/assets/${id}`).then(DeleteResponse);
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

export function getProjectStatistics() {
  return request
    .get<{
      deviceOfflineNum: number;
      deviceNum: number;
      monitoringPointAlarmNum: [number, number, number];
      monitoringPointNum: number;
      rootAssetAlarmNum: [number, number, number];
      rootAssetNum: number;
    }>(`/statistics/all`)
    .then(GetResponse);
}

export function downloadHistory(
  id: number,
  from: number,
  to: number,
  pids: any,
  lang: string,
  assetId?: number
) {
  if (assetId) {
    return request.download<any>(
      `/assets/${assetId}/download/data?from=${from}&to=${to}&pids=${pids}&lang=${lang}`
    );
  } else {
    return request.download<any>(
      `/monitoringPoints/${id}/download/data?from=${from}&to=${to}&pids=${pids}&lang=${lang}`
    );
  }
}

export function getDataOfAsset(id: AssetRow['id'], from: number, to: number) {
  return request
    .get<{ timestamp: number }[]>(`/assets/${id}/data?from=${from}&to=${to}`)
    .then(GetResponse);
}

export function getFlangeData(id: AssetRow['id'], timestamp: number) {
  return request.get<HistoryData[0]>(`/assets/${id}/data/${timestamp}`).then(GetResponse);
}
