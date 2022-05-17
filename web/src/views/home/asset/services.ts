import { Response } from '../../../types/props';
import request from '../../../utils/request';
import { DeleteResponse, GetResponse, PostResponse, PutResponse } from '../../../utils/response';
import { Asset, AssetRow } from './props';

export function getAssets() {
  //TODO add filter:type
  return request.get<AssetRow[]>(`/assets`).then(GetResponse);
}

export function addAsset(asset: Asset) {
  return request.post<Response>('/assets', asset).then(PostResponse);
}

export function updateAsset(id: Asset['id'], asset: Asset) {
  return request.put<Response>(`/assets/${id}`, asset).then(PutResponse);
}

export function deleteAsset(id: Asset['id']) {
  return request.delete<Response>(`/assets/${id}`).then(DeleteResponse);
}
