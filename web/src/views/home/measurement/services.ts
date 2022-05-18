import request from '../../../utils/request';
import { DeleteResponse, GetResponse, PostResponse, PutResponse } from '../../../utils/response';
import { Measurement, MeasurementRow } from './props';

export function getMeasurements() {
  //TODO add filter:type
  return request.get<MeasurementRow[]>(`/monitoringPoints`).then(GetResponse);
}

export function addMeasurement(measurement: Measurement) {
  // return request.post<MeasurementRow>('/monitoringPoints', measurement).then(PostResponse);
  return request.post<MeasurementRow>('/monitoringPoints', measurement);
}

export function updateMeasurement(id: Measurement['id'], measurement: Measurement) {
  return request.put(`/monitoringPoints/${id}`, measurement).then(PutResponse);
}

export function deleteMeasurement(id: Measurement['id']) {
  return request.delete(`/monitoringPoints/${id}`).then(DeleteResponse);
}

export function bindDevice(id: Measurement['id'], device_id: number) {
  return request.post(`/monitoringPoints/${id}/bindDevice`, { device_id });
}
