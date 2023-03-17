import request from '../../utils/request';
import { DeleteResponse, GetResponse, PostResponse, PutResponse } from '../../utils/response';
import { DataType, HistoryData, MonitoringPoint, MonitoringPointRow } from './types';

export function getMeasurements(filters?: Pick<MonitoringPoint, 'asset_id'>) {
  return request.get<MonitoringPoint[]>(`/monitoringPoints`, { ...filters }).then(GetResponse);
}

export function getMeasurement(id: number) {
  return request.get<MonitoringPointRow>(`/monitoringPoints/${id}`).then(GetResponse);
}

export function addMeasurement(measurement: MonitoringPoint) {
  return request.post<MonitoringPoint>('/monitoringPoints', measurement).then(PostResponse);
}

export function updateMeasurement(id: MonitoringPoint['id'], measurement: MonitoringPoint) {
  return request.put(`/monitoringPoints/${id}`, measurement).then(PutResponse);
}

export function deleteMeasurement(id: MonitoringPoint['id']) {
  return request.delete(`/monitoringPoints/${id}`).then(DeleteResponse);
}

export function bindDevice(id: MonitoringPoint['id'], device_id: number, channel?: number) {
  //TODO
  return request.post(`/monitoringPoints/${id}/bindDevice`, {
    device_id,
    process_id: channel ? 2 : 1,
    parameters: channel ? { channel } : {}
  });
}

export function unbindDevice(id: MonitoringPoint['id'], device_id: number) {
  //TODO
  return request.post(`/monitoringPoints/${id}/unbindDevice`, { device_id });
}

export function getDataOfMonitoringPoint(
  id: MonitoringPoint['id'],
  from: number,
  to: number,
  dataType?: DataType
) {
  return request
    .get<HistoryData>(
      `/monitoringPoints/${id}/data?from=${from}&to=${to}${dataType ? `&type=${dataType}` : ''}`
    )
    .then(GetResponse);
}

export function getDynamicData<T>(
  id: MonitoringPoint['id'],
  timestamp: number,
  dataType?: DataType
) {
  return request
    .get<{ timestamp: number; values: T }>(
      `/monitoringPoints/${id}/data/${timestamp}?type=${dataType}`
    )
    .then(GetResponse);
}

export function getDynamicDataVibration<T>(
  id: MonitoringPoint['id'],
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

export function addMonitoringPoints(data: {
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
