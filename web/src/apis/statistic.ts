import request from '../utils/request';
import { GetResponse } from '../utils/response';

export function GetDeviceStatisticsRequest(filters: any) {
  return request.get<any>('/statistics/devices', { ...filters }).then(GetResponse);
}

export function GetAlertStatisticsRequest(filters: any) {
  return request.get<any>('/statistics/alerts', { ...filters }).then(GetResponse);
}
