import request from '../../../utils/request';
import { DeleteResponse, GetResponse, PostResponse, PutResponse } from '../../../utils/response';
import { Measurement, MeasurementHistoryData, MeasurementRow } from './props';

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
    algorithm_id: 1,
    parameters: {}
  });
}

export function getData(id: Measurement['id'], from: number, to: number) {
  return request.get<MeasurementHistoryData>(`/monitoringPoints/${id}/data?from=${from}&to=${to}`).then(GetResponse);
}
