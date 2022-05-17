import { Response } from '../../../types/props';
import request from '../../../utils/request';
import { DeleteResponse, GetResponse, PostResponse, PutResponse } from '../../../utils/response';
import { Measurement, MeasurementRow } from './props';

export function getMeasurements() {
  //TODO add filter:type
  return request.get<MeasurementRow[]>(`/monitoringPoints`).then(GetResponse);
}

export function addMeasurement(measurement: Measurement) {
  return request.post<Response>('/monitoringPoints', measurement).then(PostResponse);
}

export function updateMeasurement(id: Measurement['id'], measurement: Measurement) {
  return request.put<Response>(`/monitoringPoints/${id}`, measurement).then(PutResponse);
}

export function deleteMeasurement(id: Measurement['id']) {
  return request.delete<Response>(`/monitoringPoints/${id}`).then(DeleteResponse);
}
