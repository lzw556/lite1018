import { ColorDanger, ColorInfo, ColorWarn } from "./color"

export function OperationTranslate(op: string) {
    switch (op) {
        case ">":
        case ">=":
            return "高于"
        case "<":
        case "<=":
            return "低于"
    }
    return ""
}

export const AlarmLevelInfo = "提示"
export const AlarmLevelWarn = "重要"
export const AlarmLevelCritical = "紧急"

export function GetAlarmLevelString(level: number) {
    switch (level) {
        case 1:
            return AlarmLevelInfo
        case 2:
            return AlarmLevelWarn
        case 3:
            return AlarmLevelCritical
    }
    return ""
}

export function GetAlarmLevelSkin(level: number) {
    switch (level) {
        case 1:
            return ColorInfo
        case 2:
            return ColorWarn
        case 3:
            return ColorDanger
    }
    return ""
}