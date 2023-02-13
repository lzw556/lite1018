import request from '../utils/request';
import { Menu } from '../types/menu';
import { GetResponse } from '../utils/response';

export function GetMyMenusRequest() {
  return request.get<Menu[]>('/my/menus').then(GetResponse);
}

export function GetMenusTreeRequest() {
  return request.get<Menu[]>('/menus/tree').then(GetResponse);
}
