
export enum DeviceType {
    Gateway = 1,
    Router = 257,
    BoltLoosening = 131073,
    BoltElongation = 196609,
    NormalTemperatureCorrosion = 262145,
    HighTemperatureCorrosion = 262401,
}

export function DeviceTypeString(value: DeviceType) {
    switch (value){
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
        default:
            return "未知类型"
    }
}

