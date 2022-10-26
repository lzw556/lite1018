import request from '../utils/request';
import { Property } from '../types/property';
import { GetResponse } from '../utils/response';

export function GetPropertiesRequest(deviceType: number) {
  return request.get<Property[]>(`/properties?device_type=${deviceType}`).then(GetResponse);
}
