import { DeviceType } from '../types/device_type';

export const FIRST_CLASS_PROPERTIES = [
  { typeId: DeviceType.BoltLoosening, properties: ['loosening_angle', 'attitude', 'motion'] },
  { typeId: DeviceType.BoltLooseningWIRED, properties: ['loosening_angle', 'attitude', 'motion'] },
  { typeId: DeviceType.BoltElongation, properties: ['preload', 'pressure', 'temperature'] },
  {
    typeId: DeviceType.BoltElongation4Channels,
    properties: ['preload', 'pressure', 'temperature']
  },
  {
    typeId: DeviceType.BoltElongation8Channels,
    properties: ['preload', 'pressure', 'temperature']
  },
  {
    typeId: DeviceType.VibrationTemperature3Axis,
    properties: ['vibration_severity_y', 'enveloping_pk2pk_y', 'temperature']
  },
  {
    typeId: DeviceType.VibrationTemperature3AxisNB,
    properties: ['vibration_severity_y', 'enveloping_pk2pk_y', 'temperature']
  },
  {
    typeId: DeviceType.HighTemperatureCorrosion,
    properties: ['thickness', 'temperature', 'annualized_corrosion_rate']
  },
  {
    typeId: DeviceType.NormalTemperatureCorrosion,
    properties: ['thickness', 'temperature', 'annualized_corrosion_rate']
  },
  { typeId: DeviceType.Pressure, properties: ['pressure'] },
  { typeId: DeviceType.PressureGuoDa, properties: ['pressure'] },
  { typeId: DeviceType.PressureWoErKe, properties: ['pressure', 'temperature'] },
  { typeId: DeviceType.PressureTemperature, properties: ['pressure', 'temperature'] },
  { typeId: DeviceType.PressureTemperatureWIRED, properties: ['pressure', 'temperature'] },
  { typeId: DeviceType.AngleDip, properties: ['inclination', 'pitch', 'roll'] },
  { typeId: DeviceType.AngleDipNB, properties: ['inclination', 'pitch', 'roll'] },
  {
    typeId: DeviceType.VibrationTemperature3AxisAdvanced,
    properties: ['vibration_severity_y', 'enveloping_pk2pk_y', 'temperature']
  },
  {
    typeId: DeviceType.VibrationTemperature3AxisAdvancedNB,
    properties: ['vibration_severity_y', 'enveloping_pk2pk_y', 'temperature']
  },
  { typeId: DeviceType.Temperature, properties: ['temperature'] },
  { typeId: DeviceType.TemperatureWIRED, properties: ['temperature'] },
  {
    typeId: DeviceType.VibrationTemperature3AxisWIRED,
    properties: ['vibration_severity_y', 'enveloping_pk2pk_y', 'temperature']
  }
];
