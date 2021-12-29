import {DeviceType} from "./device_type";

export enum MeasurementType {
    BoltLoosening = 1,
    BoltElongation,
    NormalTemperatureCorrosion,
    HighTemperatureCorrosion,
    PressureTemperature,
    FlangeLoosening,
    FlangeElongation,
    Vibration,
    AngleDip,
    TowerDisplacement,
    TowerSettlement,
}

export namespace MeasurementType {
    export function toString(type: MeasurementType): string {
        switch (type) {
            case MeasurementType.BoltLoosening:
                return "螺栓松动";
            case MeasurementType.BoltElongation:
                return "螺栓预紧力";
            case MeasurementType.PressureTemperature:
                return "压力温度";
            case MeasurementType.NormalTemperatureCorrosion:
                return "常温腐蚀";
            case MeasurementType.HighTemperatureCorrosion:
                return "高温腐蚀";
            case MeasurementType.Vibration:
                return "振动";
            case MeasurementType.AngleDip:
                return "倾角";
            case MeasurementType.TowerDisplacement:
                return "塔筒位移";
            case MeasurementType.TowerSettlement:
                return "塔筒沉降";
            case MeasurementType.FlangeLoosening:
                return "法兰螺栓松动";
            case MeasurementType.FlangeElongation:
                return "法兰螺栓预紧力";
            default:
                return "未知类型";
        }
    }

    export function toDeviceType(type?: MeasurementType) {
        switch (type) {
            case MeasurementType.BoltLoosening:
            case MeasurementType.FlangeLoosening:
                return [DeviceType.BoltLoosening]
            case MeasurementType.AngleDip:
            case MeasurementType.TowerDisplacement:
            case MeasurementType.TowerSettlement:
                return [DeviceType.AngleDip]
            case MeasurementType.BoltElongation:
            case MeasurementType.FlangeElongation:
                return [DeviceType.BoltElongation]
            case MeasurementType.NormalTemperatureCorrosion:
                return [DeviceType.NormalTemperatureCorrosion]
            case MeasurementType.HighTemperatureCorrosion:
                return [DeviceType.HighTemperatureCorrosion]
            case MeasurementType.Vibration:
                return [DeviceType.VibrationTemperature3Axis]
            default:
                return []
        }
    }
}