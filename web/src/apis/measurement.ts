import request from "../utils/request";
import {DeleteResponse, GetResponse, PostResponse, PutResponse} from "../utils/response";
import {Measurement} from "../types/measurement";
import {MeasurementField} from "../types/measurement_data";

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
    return request.get<any>(`/measurements/statistics`, {assetId}).then(GetResponse);
}

export function GetMeasurementFieldsRequest(type:number) {
    return request.get<MeasurementField[]>(`/measurements/fields`, {type}).then(GetResponse);
}

export function GetMeasurementRequest(id: number) {
    return request.get<Measurement>(`/measurements/${id}`).then(GetResponse);
}

export function GetMeasurementStatisticRequest(id: number) {
    return request.get(`/measurements/${id}/statistics`).then(GetResponse);
}

export function UpdateMeasurementSettingRequest(id: number, setting:any) {
    return request.patch(`/measurements/${id}/settings`, setting).then(PutResponse);
}

export function DownloadMeasurementRawDataRequest(id:number, timestamp:number) {
    return request.download<any>(`/measurements/${id}/rawData/${timestamp}/download`);
}

export function GetMeasurementDataRequest(id: number, from: number, to: number) {
    return request.get(`/measurements/${id}/data`, {from, to}).then(GetResponse);
}

export function GetMeasurementRawDataTimestampRequest(id: number, from: number, to: number) {
    return request.get<any>(`/measurements/${id}/rawData`, {from, to}).then(GetResponse);
}

export function GetMeasurementRawDataRequest(id: number, timestamp: number) {
    return request.get<any>(`/measurements/${id}/rawData/${timestamp}`).then(GetResponse);
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