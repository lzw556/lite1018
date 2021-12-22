import request from "../utils/request";
import {PageResult} from "../types/page";
import {AlarmRuleTemplate} from "../types/alarm_rule_template";
import {Alarm} from "../types/alarm_rule";
import {AlarmRecordStatistics} from "../types/alarm_statistics";
import {DeleteResponse, GetResponse, PostResponse, PutResponse} from "../utils/response";


export function AddAlarmTemplateRequest(params: any) {
    return request.post("/alarmTemplates", params).then(res => res.data)
}

export function PagingAlarmTemplateRequest(current: number, size: number, filter:any) {
    return request.get<PageResult<AlarmRuleTemplate>>("/alarmTemplates?method=paging", {
        page: current,
        size: size,
        ...filter,
    }).then(GetResponse)
}

export function GetRuleTemplateRequest(id: number) {
    return request.get<AlarmRuleTemplate>(`/alarmRuleTemplates/${id}`).then(GetResponse)
}

export function UpdateRuleTemplateRequest(id: number, params: any) {
    return request.put(`/alarmRuleTemplates/${id}`, params).then(PutResponse)
}

export function RemoveRuleTemplateRequest(id: number) {
    return request.delete(`/alarmRuleTemplates/${id}`).then(DeleteResponse)
}

export function CheckRuleNameRequest(name: string) {
    return request.get(`/check/alarms/${name}`).then(GetResponse)
}

export function AddAlarmRequest(createType: number, params: any) {
    return request.post(`/alarms?create_type=${createType}`, params).then(PostResponse)
}

export function PagingAlarmsRequest(filter:any, page: number, size: number) {
    return request.get<PageResult<Alarm[]>>("/alarms?method=paging", {...filter, page, size}).then(GetResponse)
}

export function GetAlarmRequest(id: number) {
    return request.get<Alarm>(`/alarms/${id}`).then(GetResponse)
}

export function UpdateAlarmRuleRequest(id: number, params: any) {
    return request.put<Alarm>(`/alarms/${id}`, params).then(PutResponse)
}

export function RemoveAlarmRuleRequest(id: number) {
    return request.delete(`/alarmRules/${id}`).then(DeleteResponse)
}

export function PagingAlarmRecordsRequest(page: number, size: number, from: number, to: number, filter: any) {
    return request.get<PageResult<any>>("/alarmRecords?method=paging", {page, size, from, to, ...filter}).then(GetResponse)
}

export function GetAlarmRecordStatisticsRequest(from: number, to: number, filter: any) {
    return request.get<AlarmRecordStatistics>(`/alarmRecords/statistics`, {from, to, ...filter}).then(GetResponse)
}

export function GetAlarmRecordRequest(id: number) {
    return request.get<any>(`/alarmRecords/${id}`).then(GetResponse)
}

export function RemoveAlarmRecordRequest(id: number) {
    return request.delete(`/alarmRecords/${id}`).then(DeleteResponse)
}

export function AcknowledgeAlarmRecordRequest(id: number, params: any) {
    return request.patch(`/alarmRecords/${id}/acknowledge`, params).then(PutResponse)
}

export function GetAcknowledgeRequest(id: number) {
    return request.get<any>(`/alarmRecords/${id}/acknowledge`).then(GetResponse)
}