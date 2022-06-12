import { ProjectStatistics } from '..';
import request from '../../../utils/request';
import { DeleteResponse, GetResponse, PostResponse, PutResponse } from '../../../utils/response';
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