import request from '../utils/request';
import { Firmware } from '../types/firmware';
import { DeleteResponse, GetResponse } from '../utils/response';
import { PageResult } from '../types/page';

export function PagingFirmwaresRequest(page: number, size: number) {
  return request.get<PageResult<Firmware[]>>('/firmwares', { page, size }).then(GetResponse);
}

export function RemoveFirmwareRequest(id: number) {
  return request.delete(`/firmwares/${id}`).then(DeleteResponse);
}

export function UploadFirmwareRequest(file: any) {
  return request.upload('/firmwares', file).then((res) => res.data);
}

export function GetDeviceFirmwaresRequest(id: number) {
  return request.get<Firmware[]>(`/devices/${id}/firmwares`).then(GetResponse);
}
