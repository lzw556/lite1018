import {ColorDanger, ColorInfo, ColorWarn} from "../constants/color";

export type AlertState = {
    alarm: {
        id: number,
        field: string
    }
    level: number
    content: string
}

export function GetAlertColor(state: AlertState | undefined) {
    switch (state?.level) {
        case 1:
            return ColorInfo
        case 2:
            return ColorWarn
        case 3:
            return ColorDanger
    }
}