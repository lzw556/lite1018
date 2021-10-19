import request from "../utils/request";
import {PageResult} from "../types/page";
import {AlarmRuleContent, AlarmRuleTemplate} from "../types/alarm_rule_template";
import {AlarmRule} from "../types/alarm_rule";


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

export function GetRuleTemplateRequest(id:number) {
    return request.get<AlarmRuleTemplate>(`/alarmRuleTemplates/${id}`).then(res => res.data)
}

export function UpdateRuleTemplateRequest(id:number, params:any) {
    return request.put(`/alarmRuleTemplates/${id}`, params).then(res => res.data)
}

export function RemoveRuleTemplateRequest(id:number) {
    return request.delete(`/alarmRuleTemplates/${id}`).then(res => res.data)
}

export function CheckRuleNameRequest(name:string) {
    return request.get(`/alarmRules/check/${name}`).then(res => res.data)
}

export function AddAlarmRuleRequest(params:any) {
    return request.post("/alarmRules", params).then(res => res.data)
}

export function PagingAlarmRulesRequest(assetId:number, deviceId: number, page:number,size:number) {
    return request.get<PageResult<AlarmRule[]>>("/alarmRules", {assetId, deviceId, page, size}).then(res => res.data)
}

export function GetAlarmRuleRequest(id:number) {
    return request.get<AlarmRule>(`/alarmRules/${id}`).then(res => res.data)
}

export function UpdateAlarmRuleRequest(id:number, params:any) {
    return request.put<AlarmRule>(`/alarmRules/${id}`, params).then(res => res.data)
}

export function RemoveAlarmRuleRequest(id:number) {
    return request.delete(`/alarmRules/${id}`).then(res => res.data)
}