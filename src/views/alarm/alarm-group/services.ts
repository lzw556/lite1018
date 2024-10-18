import request from '../../../utils/request';
import { DeleteResponse, GetResponse, PostResponse, PutResponse } from '../../../utils/response';
import { Property } from '../../asset-common';
import { AlarmRule } from './types';

export function addAlarmRule(rule: AlarmRule) {
  return request.post(`alarmRuleGroups`, rule).then(PostResponse);
}

export function getAlarmRules(...monitoring_point_ids: number[]) {
  const params =
    monitoring_point_ids && monitoring_point_ids.length > 0
      ? `?monitoring_point_ids=${monitoring_point_ids.join(',')}`
      : '';
  return request.get<AlarmRule[]>(`alarmRuleGroups${params}`).then(GetResponse);
}

export function getAlarmRule(id: number) {
  return request.get<AlarmRule>(`alarmRuleGroups/${id}`).then(GetResponse);
}

export function updateAlarmRule(id: number, rule: AlarmRule) {
  return request.put(`alarmRuleGroups/${id}`, rule).then(PutResponse);
}

export function deleteAlarmRule(id: number) {
  return request.delete(`alarmRuleGroups/${id}`).then(DeleteResponse);
}

export function bindMeasurementsToAlarmRule(
  id: number,
  values: { monitoring_point_ids: number[] }
) {
  return request.post(`/alarmRuleGroups/${id}/bind`, values).then(PutResponse);
}

export function unbindMeasurementsToAlarmRule(
  id: number,
  values: { monitoring_point_ids: number[] }
) {
  return request.post(`/alarmRuleGroups/${id}/unbind`, values).then(PutResponse);
}

export function bindMeasurementsToAlarmRule2(
  id: number,
  values: { monitoring_point_ids?: number[] }
) {
  return request.put(`/alarmRuleGroups/${id}/bindings`, values).then(PutResponse);
}

export function exportAlarmRules(alarm_rule_group_ids?: number[]) {
  if (alarm_rule_group_ids && alarm_rule_group_ids.length > 0) {
    return request.download<any>(
      `alarmRuleGroups/exportFile?alarm_rule_group_ids=${alarm_rule_group_ids.join(',')}`
    );
  } else {
    return request.download<any>(`alarmRuleGroups/exportFile`);
  }
}

export function importAlarmRules(data: any) {
  return request.post<any>(`alarmRuleGroups/import`, data);
}

export function getPropertiesByMeasurementType(type: number) {
  return request
    .get<Property[]>(`/properties?type=monitoring_point&monitoring_point_type=${type}`)
    .then(GetResponse);
}
