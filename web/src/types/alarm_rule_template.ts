import {InitializeProperty, Property} from "./property";

export type AlarmRuleTemplate = {
    id: number
    name: string
    deviceType: number
    property: Property
    rule: AlarmRuleContent
    level: number
    description: string
}

export type AlarmRuleContent = {
    field: string
    method: string
    operation: string
    threshold: number
}

export const InitializeRule: AlarmRuleContent = {
    field: "",
    method: "current",
    operation: ">",
    threshold: 0,
}

export const InitializeAlarmRuleTemplate: AlarmRuleTemplate = {
    id: 0,
    name: "",
    deviceType: 0,
    property: InitializeProperty,
    rule: InitializeRule,
    level: 1,
    description: ""
}
