export enum DeviceType {
    Gateway = 1,
    Router = 257,
    BoltLoosening = 131073,
    BoltElongation = 196609,
    NormalTemperatureCorrosion = 262145,
    HighTemperatureCorrosion = 262401,
    VibrationTemperature3Axis = 327938,
    VibrationTemperature3AxisAdvanced = 327940,
    VibrationTemperature3AxisNB = 327941,
    VibrationTemperature3AxisAdvancedNB = 327942,
    Temperature = 393217,
    PressureTemperature = 524290,
    AngleDip = 589825,
    AngleDipNB = 589826
}

export namespace DeviceType {
    export function toString(type: DeviceType) {
        switch (type) {
            case DeviceType.Gateway:
                return "网关"
            case DeviceType.Router:
                return "中继器"
            case DeviceType.BoltElongation:
                return "螺栓预紧力"
            case DeviceType.BoltLoosening:
                return "螺栓松动"
            case DeviceType.HighTemperatureCorrosion:
                return "高温腐蚀"
            case DeviceType.NormalTemperatureCorrosion:
                return "常温腐蚀"
            case DeviceType.VibrationTemperature3Axis:
                return "3轴振动温度"
            case DeviceType.VibrationTemperature3AxisNB:
                return "3轴振动温度(NB)"
            case DeviceType.VibrationTemperature3AxisAdvanced:
                return "高端3轴振动温度"
            case DeviceType.VibrationTemperature3AxisAdvancedNB:
                return "高端3轴振动温度(NB)"
            case DeviceType.Temperature:
                return "温度"
            case DeviceType.PressureTemperature:
                return "压力温度"
            case DeviceType.AngleDip:
                return "倾角"
            case DeviceType.AngleDipNB:
                return "倾角(NB)"
            default:
                return "未知类型"
        }
    }

    export function sensors() {
        return [
            DeviceType.BoltLoosening,
            DeviceType.BoltElongation,
            DeviceType.NormalTemperatureCorrosion,
            DeviceType.HighTemperatureCorrosion,
            DeviceType.VibrationTemperature3Axis,
            DeviceType.VibrationTemperature3AxisAdvanced,
            DeviceType.VibrationTemperature3AxisNB,
            DeviceType.VibrationTemperature3AxisAdvancedNB,
            DeviceType.Temperature,
            DeviceType.PressureTemperature,
            DeviceType.AngleDip,
            DeviceType.AngleDipNB,
        ]
    }

    export function isNB(type: DeviceType | undefined) {
        switch (type) {
            case DeviceType.AngleDipNB:
            case DeviceType.VibrationTemperature3AxisNB:
            case DeviceType.VibrationTemperature3AxisAdvancedNB:
                return true
        }
        return false
    }
}

