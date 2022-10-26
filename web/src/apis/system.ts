import request from '../utils/request';
import { System } from '../types/system';
import { GetResponse } from '../utils/response';

export function GetSystemRequest() {
  return request.get<System>('/system').then(GetResponse);
}

export function RebootSystemRequest() {
  return request.post('/system/reboot', null).then((res) => res.data);
}
