import request from '../../../utils/request';
import { DeleteResponse, GetResponse, PostResponse, PutResponse } from '../../../utils/response';
import { HistoryData } from '../common/historyDataHelper';
import { Measurement, MeasurementRow } from './props';

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

export function getData(id: Measurement['id'], from: number, to: number, rawOnly: boolean = false) {
  return request.get<HistoryData>(`/monitoringPoints/${id}/data?from=${from}&to=${to}${rawOnly ? `&type=raw` : ''}`).then(GetResponse);
}
