import request from "../utils/request";
import {PageResult} from "../types/page";
import {AlarmRuleTemplate} from "../types/alarm_rule_template";
import {AlarmRule} from "../types/alarm_rule";
import {AlarmStatistics} from "../types/alarm_statistics";
import {DeleteResponse, GetResponse, PostResponse, PutResponse} from "../utils/response";


export function AddAlarmRuleTemplateRequest(params: any) {
    return request.post("/alarmRuleTemplates", params).then(res => res.data)
}

export function PagingRuleTemplateRequest(current: number, size: number, deviceType: number) {
    return request.get<PageResult<AlarmRuleTemplate>>("/alarmRuleTemplates", {
        page: current,
        size: size,
        device_type: deviceType,
    }).then(res => res.data)
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
    return request.get(`/check/alarmRules/${name}`).then(GetResponse)
}

export function AddAlarmRuleRequest(params: any) {
    return request.post("/alarmRules", params).then(PostResponse)
}

export function PagingAlarmRulesRequest(assetId: number, deviceId: number, page: number, size: number) {
    return request.get<PageResult<AlarmRule[]>>("/alarmRules", {assetId, deviceId, page, size}).then(GetResponse)
}

export function GetAlarmRuleRequest(id: number) {
    return request.get<AlarmRule>(`/alarmRules/${id}`).then(GetResponse)
}

export function UpdateAlarmRuleRequest(id: number, params: any) {
    return request.put<AlarmRule>(`/alarmRules/${id}`, params).then(PutResponse)
}

export function RemoveAlarmRuleRequest(id: number) {
    return request.delete(`/alarmRules/${id}`).then(DeleteResponse)
}

export function PagingAlarmRecordsRequest(page: number, size: number, from: number, to: number, filter: any) {
    return request.get<PageResult<any>>("/alarmRecords", {page, size, from, to, filter}).then(GetResponse)
}

export function GetAlarmStatisticsRequest(from: number, to: number, filter: any) {
    return request.get<AlarmStatistics>(`/alarmStatistics`, {from, to, filter}).then(GetResponse)
}

export function GetAlarmRecordRequest(id: number) {
    return request.get<any>(`/alarmRecords/${id}`).then(GetResponse)
}

export function RemoveAlarmRecordRequest(id: number) {
    return request.delete(`/alarmRecords/${id}`).then(DeleteResponse)
}

export function AcknowledgeAlarmRecordRequest(id: number) {
    return request.patch(`/alarmRecords/${id}/acknowledge`, null).then(PutResponse)
}