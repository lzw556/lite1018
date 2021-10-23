import {AlarmRule} from "./alarm_rule";

export type PropertyData = {
    name: string
    unit: string
    time: number[]
    fields: any
    alarms: AlarmRule[]
}