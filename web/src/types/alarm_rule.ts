import {Device} from "./device";
import {Property} from "./property";
import {AlarmRuleContent} from "./alarm_rule_template";

export type AlarmRule = {
    id: number
    name: string
    device: Device
    property: Property
    rule: AlarmRuleContent
    level: number
    description: string
    enabled: boolean
}