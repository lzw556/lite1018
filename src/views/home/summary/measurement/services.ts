import request from '../../../../utils/request';
import { DeleteResponse, GetResponse, PostResponse, PutResponse } from '../../../../utils/response';
import { HistoryData } from '../../common/historyDataHelper';
import { DataType } from './contentTabs/dynamicDataHelper';
import { AlarmRule, Measurement, MeasurementRow, Property } from './props';

export function getMeasurements(filters?: Pick<Measurement, 'asset_id'>) {
  return request.get<MeasurementRow[]>(`/monitoringPoints`, { ...filters }).then(GetResponse);
}

export function getMeasurement(id: number) {
  return request.get<MeasurementRow>(`/monitoringPoints/${id}`).then(GetResponse);
}

export function addMeasurement(measurement: Measurement) {
  return request.post<MeasurementRow>('/monitoringPoints', measurement).then(PostResponse);
}

export function updateMeasurement(id: Measurement['id'], measurement: Measurement) {
  return request.put(`/monitoringPoints/${id}`, measurement).then(PutResponse);
}

export function deleteMeasurement(id: Measurement['id']) {
  return request.delete(`/monitoringPoints/${id}`).then(DeleteResponse);
}

export function bindDevice(id: Measurement['id'], device_id: number) {
  //TODO
  return request.post(`/monitoringPoints/${id}/bindDevice`, {
    device_id,
    process_id: 1,
    parameters: {}
  });
}

export function unbindDevice(id: Measurement['id'], device_id: number) {
  //TODO
  return request.post(`/monitoringPoints/${id}/unbindDevice`, { device_id });
}

export function getData(id: Measurement['id'], from: number, to: number, dataType?: DataType) {
  return request
    .get<HistoryData>(
      `/monitoringPoints/${id}/data?from=${from}&to=${to}${dataType ? `&type=${dataType}` : ''}`
    )
    .then(GetResponse);
}

export function getDynamicData<T>(id: Measurement['id'], timestamp: number, dataType: DataType) {
  return request
    .get<{ timestamp: number; values: T }>(
      `/monitoringPoints/${id}/data/${timestamp}?type=${dataType}`
    )
    .then(GetResponse);
}

export function getDynamicDataVibration<T>(
  id: Measurement['id'],
  timestamp: number,
  dataType: DataType,
  filter: { field: string; axis: number }
) {
  return request
    .get<{ timestamp: number; values: T }>(
      `/monitoringPoints/${id}/data/${timestamp}?type=${dataType}&calculate=${filter.field}&dimension=${filter.axis}`
    )
    .then(GetResponse);
}

export function getPropertiesByMeasurementType(type: number) {
  return request
    .get<Property[]>(`/properties?type=monitoring_point&monitoring_point_type=${type}`)
    .then(GetResponse);
}

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

export function downloadHistory(id: number, from: number, to: number, pids: any, assetId?: number) {
  if (assetId) {
    return request.download<any>(
      `/assets/${assetId}/download/data?from=${from}&to=${to}&pids=${pids}`
    );
  } else {
    return request.download<any>(
      `/monitoringPoints/${id}/download/data?from=${from}&to=${to}&pids=${pids}`
    );
  }
}

export function clearHistory(id: number, from: number, to: number, type: string = '') {
  const url =
    type === 'raw'
      ? `/monitoringPoints/${id}/data?from=${from}&to=${to}&type=${type}`
      : `/monitoringPoints/${id}/data?from=${from}&to=${to}`;
  return request.delete(url);
}

export function downloadRawHistory(id: number, timestamp: number) {
  return request.download<any>(`/monitoringPoints/${id}/download/data/${timestamp}`);
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

export function addMeasurements(data: {
  monitoring_points: {
    asset_id: number;
    name: string;
    type: number;
    attributes?: { index: number };
    device_binding: { device_id: number; process_id?: number; parameters?: { channel: number } };
  }[];
}) {
  return request.post<any>(`monitoringPoints/batch`, data).then(PostResponse);
}
