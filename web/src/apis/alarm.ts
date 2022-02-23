import request from "../utils/request";
import {PageResult} from "../types/page";
import {AlarmRule, AlarmRuleTemplate} from "../types/alarm_rule_template";
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

export function GetAlarmTemplateRequest(id: number) {
    return request.get<AlarmRuleTemplate>(`/alarmTemplates/${id}`).then(GetResponse)
}

export function UpdateAlarmTemplateRequest(id: number, params: any) {
    return request.put(`/alarmTemplates/${id}`, params).then(PutResponse)
}

export function RemoveAlarmTemplateRequest(id: number) {
    return request.delete(`/alarmTemplates/${id}`).then(DeleteResponse)
}

export function CheckAlarmNameRequest(name: string) {
    return request.get(`/check/alarms/${name}`).then(GetResponse)
}

export function AddAlarmRuleRequest(params: any) {
    return request.post("/alarmRules", params).then(PostResponse)
}

export function PagingAlarmRuleRequest(filters:any, page: number, size: number) {
    return request.get<PageResult<AlarmRule[]>>("/alarmRules", {...filters, page, size}).then(GetResponse)
}

export function GetAlarmRuleRequest(id: number) {
    return request.get<any>(`/alarmRules/${id}`).then(GetResponse)
}

export function UpdateAlarmRequest(id: number, params: any) {
    return request.put<Alarm>(`/alarms/${id}`, params).then(PutResponse)
}

export function RemoveAlarmRequest(id: number) {
    return request.delete(`/alarms/${id}`).then(DeleteResponse)
}

export function PagingAlarmRecordsRequest(page: number, size: number, from: number, to: number, filter: any) {
    return request.get<PageResult<any>>("/alarmRecords?method=paging", {page, size, from, to, ...filter}).then(GetResponse)
}

export function GetAlarmRecordStatisticsRequest(from: number, to: number, filter: any) {
    return request.get<AlarmRecordStatistics>(`/statistics/alarmRecords`, {from, to, ...filter}).then(GetResponse)
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