import request from "../utils/request";
import {DeleteResponse, GetResponse, PostResponse, PutResponse} from "../utils/response";
import {Measurement} from "../types/measurement";
import {MeasurementField} from "../types/measurement_data";
import {WaveData} from "../types/wave_data";

export function AddMeasurementRequest(params: any) {
    return request.post(`/measurements`, params).then(PostResponse);
}

export function CheckMacBindingRequest(mac: string) {
    return request.get(`/check/deviceBinding/${mac}`).then(GetResponse)
}

export function GetMeasurementsRequest(filter:any) {
    return request.get<Measurement[]>(`/measurements`, {...filter}).then(GetResponse);
}

export function GetMeasurementStatisticsRequest(assetId: number) {
    return request.get<any>(`/statistics/measurements`, {asset_id: assetId}).then(GetResponse);
}

export function GetMeasurementFieldsRequest(type:number) {
    return request.get<MeasurementField[]>(`/measurements/fields`, {type}).then(GetResponse);
}

export function GetMeasurementRequest(id: number) {
    return request.get<Measurement>(`/measurements/${id}`).then(GetResponse);
}

export function GetMeasurementDataStatisticRequest(id: number) {
    return request.get<any>(`/statistics/measurements/${id}/data`).then(GetResponse);
}

export function GetMeasurementAlertStatisticRequest(id: number) {
    return request.get<any>(`/statistics/measurements/${id}/alert`).then(GetResponse);
}

export function UpdateMeasurementSettingRequest(id: number, setting:any) {
    return request.patch(`/measurements/${id}/settings`, setting).then(PutResponse);
}

export function DownloadMeasurementRawDataRequest(id:number, timestamp:number, params:any) {
    return request.download<any>(`/measurements/${id}/waveData/${timestamp}/download`, params);
}

export function GetMeasurementDataRequest(id: number, from: number, to: number) {
    return request.get(`/measurements/${id}/data`, {from, to}).then(GetResponse);
}

export function GetMeasurementWaveDataTimestampRequest(id: number, from: number, to: number) {
    return request.get<any>(`/measurements/${id}/waveData`, {from, to}).then(GetResponse);
}

export function GetMeasurementWaveDataRequest(id: number, timestamp: number, params: any) {
    return request.get<WaveData>(`/measurements/${id}/waveData/${timestamp}`, params).then(GetResponse);
}

export function UpdateMeasurementRequest(id: number, params: any) {
    return request.put(`/measurements/${id}`, params).then(PutResponse);
}

export function UpdateMeasurementDevicesBindingRequest(id: number, params: any) {
    return request.patch(`/measurements/${id}/devices`, params).then(PutResponse);
}

export function RemoveMeasurementRequest(id:number) {
    return request.delete(`/measurements/${id}`).then(DeleteResponse);
}

export function RemoveMeasurementDataRequest(id:number, from:number, to:number) {
    return request.delete(`/measurements/${id}/data?from=${from}&to=${to}`).then(DeleteResponse);
}