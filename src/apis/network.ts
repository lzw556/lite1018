import request from '../utils/request';
import { Network } from '../types/network';
import { DeleteResponse, GetResponse, PostResponse, PutResponse } from '../utils/response';
import { PageResult } from '../types/page';

export function GetNetworkRequest(id: number) {
  return request.get<Network>(`/networks/${id}`).then(GetResponse);
}

export function GetNetworksRequest() {
  return request.get<Network[]>('/networks').then(GetResponse);
}

export function PagingNetworksRequest(filter: any, page: number, size: number) {
  return request
    .get<PageResult<Network[]>>(`/networks`, { ...filter, page, size })
    .then(GetResponse);
}

export function AccessDevicesRequest(networkId: number, params: any) {
  return request.patch(`/networks/${networkId}/devices`, params).then(PutResponse);
}

export function AddDeviceRequest(id: number, param: any) {
  return request.post(`/networks/${id}/devices`, param).then(PostResponse);
}

export function RemoveDevicesRequest(networkId: number, params: any) {
  return request.delete(`/networks/${networkId}/devices`, params).then(DeleteResponse);
}

export function ImportNetworkRequest(params: any) {
  return request.post('/networks/import', params).then(PostResponse);
}

export function CreateNetworkRequest(params: any) {
  return request.post('/networks', params).then(PostResponse);
}

export function ExportNetworkRequest(id: number) {
  return request.download<any>(`/networks/${id}/export`);
}

export function UpdateNetworkSettingRequest(gatewayId: number, wsn: any) {
  return request.put(`/networks/setting?gatewayId=${gatewayId}`, wsn).then(PutResponse);
}

export function UpdateNetworkRequest(id: number, params: any) {
  return request.put<Network>(`/networks/${id}`, params).then(PutResponse);
}

export function NetworkSyncRequest(id: number) {
  return request.put(`/networks/${id}/sync`, null).then((res) => res.data);
}

export function NetworkProvisionRequest(id: number) {
  return request.put(`/networks/${id}/provision`, null).then((res) => res.data);
}

export function DeleteNetworkRequest(id: number) {
  return request.delete(`/networks/${id}`).then(DeleteResponse);
}
