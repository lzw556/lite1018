import {DeviceType} from "./device_type";

export enum MeasurementType {
    BoltLoosening = 1,
    BoltElongation,
    CorrosionThickness,
    Pressure,
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
            case MeasurementType.Pressure:
                return "压力温度";
            case MeasurementType.CorrosionThickness:
                return "腐蚀厚度";
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
            case MeasurementType.CorrosionThickness:
                return [DeviceType.NormalTemperatureCorrosion, DeviceType.HighTemperatureCorrosion]
            case MeasurementType.Vibration:
                return [DeviceType.VibrationTemperature3Axis]
            default:
                return []
        }
    }
}