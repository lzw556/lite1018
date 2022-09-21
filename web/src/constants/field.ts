import {DeviceType} from "../types/device_type";

export function GetFieldName(key:string) {
    switch (key) {
        case "loosening_angle":
            return "松动角度"
        case "attitude":
            return "姿态指数"
        case "motion":
            return "移动指数"
        case "preload":
            return "预紧力"
        case "defection":
            return "缺陷位置"
        case "length":
            return "长度"
        case "temperature":
            return "温度"
        case "tof":
            return "飞行时间"
        case "acceleration_x":
            return "加速度X轴"
        case "acceleration_y":
            return "加速度Y轴"
        case "acceleration_z":
            return "加速度Z轴"
        case "thickness":
            return "厚度"
        case "corrosion_rate":
            return "腐蚀率"
        case "inclination":
            return "倾斜角"
        case "pitch":
            return "俯仰角"
        case "roll":
            return "翻滚角"
        case "velocity_x":
            return "速度X轴"
        case "velocity_y":
            return "速度Y轴"
        case "velocity_z":
            return "速度Z轴"
        case "displacement_x":
            return "位移X轴"
        case "displacement_y":
            return "位移Y轴"
        case "displacement_z":
            return "位移Z轴"
        case "enveloping_x":
            return "真峰峰值X轴"
        case "enveloping_y":
            return "真峰峰值Y轴"
        case "enveloping_z":
            return "真峰峰值Z轴"
        case "crest_factor_x":
            return "波峰因数X轴"
        case "crest_factor_y":
            return "波峰因数Y轴"
        case "crest_factor_z":
            return "波峰因数Z轴"
        default:
            return "未知属性"
    }
}

export const FIRST_CLASS_PROPERTIES = [
    { typeId: DeviceType.BoltLoosening, properties:['loosening_angle', 'attitude', 'motion'] },
    { typeId: DeviceType.BoltElongation, properties:['preload', 'temperature', 'pressure'] },
    { typeId: DeviceType.VibrationTemperature3Axis, properties:['vibration_severity_y', 'enveloping_pk2pk_y', 'temperature'] },
    { typeId: DeviceType.VibrationTemperature3AxisNB, properties:['vibration_severity_y', 'enveloping_pk2pk_y', 'temperature'] },
    { typeId: DeviceType.HighTemperatureCorrosion, properties:['thickness', 'temperature', 'annualized_corrosion_rate'] },
    { typeId: DeviceType.NormalTemperatureCorrosion, properties:['thickness', 'temperature', 'annualized_corrosion_rate'] },
    { typeId: DeviceType.PressureTemperature, properties:['loosening_angle', 'attitude', 'motion'] },
    { typeId: DeviceType.AngleDip, properties:['inclination', 'pitch', 'roll'] },
    { typeId: DeviceType.AngleDipNB, properties:['inclination', 'pitch', 'roll'] },
    { typeId: DeviceType.VibrationTemperature3AxisAdvanced, properties:['vibration_severity_y', 'enveloping_pk2pk_y', 'temperature'] },
    { typeId: DeviceType.VibrationTemperature3AxisAdvancedNB, properties:['vibration_severity_y', 'enveloping_pk2pk_y', 'temperature'] },
    { typeId: DeviceType.Temperature, properties: ['temperature']}

]