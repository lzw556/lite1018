import request from '../../../utils/request';
import {
  DeleteResponse,
  GetResponse,
  HandlePutResponse,
  PostResponse,
  PutResponse
} from '../../../utils/response';
import {
  DataType,
  HistoryData,
  MonitoringPoint,
  MonitoringPointRow,
  VibrationAnalysisRequest
} from './types';

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

export function bindDevice(
  id: MonitoringPoint['id'],
  device_id: number,
  channel?: number,
  processId: number = 1
) {
  //TODO
  return request.post(`/monitoringPoints/${id}/bindDevice`, {
    device_id,
    process_id: processId,
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
  dataType?: DataType,
  filter?: { field: string; axis: number }
) {
  let url = `/monitoringPoints/${id}/data/${timestamp}?type=${dataType}`;
  if (filter) {
    url = `/monitoringPoints/${id}/data/${timestamp}?type=${dataType}&calculate=${filter?.field}&dimension=${filter?.axis}`;
  }
  return request.get<T>(url).then(GetResponse);
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

export function downloadRawHistory(
  id: number,
  timestamp: number,
  lang: string,
  type?: DataType,
  filter?: { field: string; axis: number }
) {
  return request.download<any>(
    `/monitoringPoints/${id}/download/data/${timestamp}`,
    filter
      ? { lang, type, calculate: filter.field }
      : {
          lang,
          type
        }
  );
}

export type ValuesPropertyName = `${'acceleration' | 'velocity' | 'displacement'}${
  | 'XRMS'
  | 'YRMS'
  | 'ZRMS'}`;

export type TrendData = {
  timestamp: number;
  values: { [key in ValuesPropertyName]: number };
  selected: boolean;
};

export function getTrend(id: number, from: number, to: number) {
  return request
    .get<TrendData[]>(`/monitoringPoints/${id}/data?from=${from}&to=${to}&type=trend`)
    .then(GetResponse);
}

export async function frequency(data: VibrationAnalysisRequest) {
  return request
    .put<{ rms: number; x: number[]; y: number[] }>('algo/frequencySpectrum', data)
    .then(HandlePutResponse);
}

export async function timeEnvelope(data: VibrationAnalysisRequest) {
  return request
    .put<{ rms: number; x: number[]; y: number[] }>('algo/timeEnvelope', data)
    .then(HandlePutResponse);
}

export async function envelope(data: VibrationAnalysisRequest) {
  return request
    .put<{ rms: number; x: number[]; y: number[] }>('algo/envelopeSpectrum', data)
    .then(HandlePutResponse);
}

export async function power(data: VibrationAnalysisRequest) {
  return request
    .put<{ rms: number; x: number[]; y: number[] }>('algo/powerSpectrum', data)
    .then(HandlePutResponse);
}

export async function cross(
  data: Omit<VibrationAnalysisRequest, 'data' | 'property'> & { data_x: number[]; data_y: number[] }
) {
  return request
    .put<{ density: number[]; phase: number[]; x: number[] }>('algo/crossSpectrum', data)
    .then(HandlePutResponse);
}

export async function zoom(data: VibrationAnalysisRequest) {
  return request
    .put<{ rms: number; x: number[]; y: number[] }>('algo/zoomSpectrum', data)
    .then(HandlePutResponse);
}

export async function cepstrum(data: VibrationAnalysisRequest) {
  return request
    .put<{ rms: number; x: number[]; y: number[] }>('algo/cepstrumSpectrum', data)
    .then(HandlePutResponse);
}

export async function timeFrequency(data: VibrationAnalysisRequest) {
  return request
    .put<{ x: number[]; y: number[]; z: number[][] }>('algo/timeFrequency', data)
    .then(HandlePutResponse);
}

export type ThicknessAnalysis = {
  b_1_month: number;
  b_3_months: number;
  b_6_months: number;
  b_1_year: number;
  b_all: number;
  k_1_month: number;
  k_3_months: number;
  k_6_months: number;
  k_1_year: number;
  k_all: number;
  residual_life_1_month: number;
  residual_life_3_months: number;
  residual_life_6_months: number;
  residual_life_1_year: number;
  residual_life_all: number;
  corrosion_rate_1_month: number;
  corrosion_rate_3_months: number;
  corrosion_rate_6_months: number;
  corrosion_rate_1_year: number;
  corrosion_rate_all: number;
};

export function getThicknessAnalysis(id: number, from: number, to: number) {
  return request
    .get<{
      data: HistoryData;
      analysisResult: ThicknessAnalysis;
    }>(`monitoringPoints/${id}/analysisResult?from=${from}&to=${to}`)
    .then(GetResponse);
}

export function batchDownload(id: number, type: string, timestamps: number[], isVibration = false) {
  return request.download<any>(
    `monitoringPoints/${id}/batchDownload/data?type=${type}&timestamps=${timestamps.join(',')}${
      isVibration ? '&calculate=accelerationTimeDomain' : ''
    }`
  );
}
