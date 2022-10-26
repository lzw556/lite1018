import request from '../utils/request';
import { PageResult } from '../types/page';
import { AlarmRule, AlarmRuleTemplate } from '../types/alarm_rule_template';
import { Alarm } from '../types/alarm_rule';
import { AlarmRecordStatistics } from '../types/alarm_statistics';
import { DeleteResponse, GetResponse, PostResponse, PutResponse } from '../utils/response';

export function AddAlarmTemplateRequest(params: any) {
  return request.post('/alarmTemplates', params).then((res) => res.data);
}

export function PagingAlarmTemplateRequest(current: number, size: number, filter: any) {
  return request
    .get<PageResult<AlarmRuleTemplate>>('/alarmTemplates?method=paging', {
      page: current,
      size: size,
      ...filter
    })
    .then(GetResponse);
}

export function GetAlarmTemplateRequest(id: number) {
  return request.get<AlarmRuleTemplate>(`/alarmTemplates/${id}`).then(GetResponse);
}

export function UpdateAlarmTemplateRequest(id: number, params: any) {
  return request.put(`/alarmTemplates/${id}`, params).then(PutResponse);
}

export function RemoveAlarmTemplateRequest(id: number) {
  return request.delete(`/alarmTemplates/${id}`).then(DeleteResponse);
}

export function CheckAlarmRuleNameRequest(name: string) {
  return request.get(`/check/alarmRules/${name}`).then(GetResponse);
}

export function AddAlarmRuleRequest(params: any) {
  return request.post('/alarmRules', params).then(PostResponse);
}

export function PagingAlarmRuleRequest(filters: any, page: number, size: number) {
  return request
    .get<PageResult<AlarmRule[]>>('/alarmRules', { ...filters, page, size })
    .then(GetResponse);
}

export function GetAlarmRuleRequest(id: number) {
  return request.get<any>(`/alarmRules/${id}`).then(GetResponse);
}

export function UpdateAlarmRuleRequest(id: number, params: any) {
  return request.put<Alarm>(`/alarmRules/${id}`, params).then(PutResponse);
}

export function UpdateAlarmRuleStatusRequest(id: number, status: number) {
  return request.put(`/alarmRules/${id}/status/${status}`, null).then(PutResponse);
}

export function AddAlarmRuleSourceRequest(id: number, params: any) {
  return request.post(`/alarmRules/${id}/sources`, params).then(PostResponse);
}

export function RemoveAlarmRuleSourceRequest(id: number, params: any) {
  return request.delete(`/alarmRules/${id}/sources`, params).then(DeleteResponse);
}

export function RemoveAlarmRuleRequest(id: number) {
  return request.delete(`/alarmRules/${id}`).then(DeleteResponse);
}

export function PagingAlarmRecordRequest(
  page: number,
  size: number,
  from: number,
  to: number,
  filter: any,
  sourceId?: number
) {
  return request
    .get<PageResult<any>>(`${sourceId ? `/alarmRecords?source_id=${sourceId}` : `/alarmRecords`}`, {
      page,
      size,
      from,
      to,
      ...filter
    })
    .then(GetResponse);
}

export function AcknowledgeAlarmRecordRequest(id: number, params: any) {
  return request.post(`/alarmRecords/${id}/acknowledge`, params).then(PutResponse);
}

export function GetAlarmRecordAcknowledgeRequest(id: number) {
  return request.get(`/alarmRecords/${id}/acknowledge`).then(GetResponse);
}

export function GetAlarmRecordStatisticsRequest(from: number, to: number, filter: any) {
  return request
    .get<AlarmRecordStatistics>(`/statistics/alarmRecords`, { from, to, ...filter })
    .then(GetResponse);
}

export function GetAlarmRecordRequest(id: number) {
  return request.get<any>(`/alarmRecords/${id}`).then(GetResponse);
}

export function RemoveAlarmRecordRequest(id: number) {
  return request.delete(`/alarmRecords/${id}`).then(DeleteResponse);
}
