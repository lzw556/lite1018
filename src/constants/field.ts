import { DeviceType } from '../types/device_type';
import intl from 'react-intl-universal';

export function GetFieldName(key: string) {
  switch (key) {
    case 'loosening_angle':
      return intl.get('FIELD_LOOSENING_ANGLE');
    case 'attitude':
      return intl.get('FIELD_ATTITUDE');
    case 'motion':
      return intl.get('FIELD_MOTION');
    case 'preload':
      return intl.get('FIELD_PRELOAD');
    case 'defection':
      return intl.get('FIELD_DEFECT_LOCATION');
    case 'length':
      return intl.get('LENGTH');
    case 'temperature':
      return intl.get('FIELD_TEMPERATURE');
    case 'tof':
      return intl.get('FIELD_TOF');
    case 'acceleration_x':
      return intl.get('FIELD_ACCELERATION_X');
    case 'acceleration_y':
      return intl.get('FIELD_ACCELERATION_Y');
    case 'acceleration_z':
      return intl.get('FIELD_ACCELERATION_Z');
    case 'thickness':
      return intl.get('FIELD_THICKNESS');
    case 'corrosion_rate':
      return intl.get('FIELD_CORROSION_RATE');
    case 'inclination':
      return intl.get('FIELD_INCLINATION');
    case 'pitch':
      return intl.get('FIELD_PITCH');
    case 'roll':
      return intl.get('FIELD_ROLL');
    case 'velocity_x':
      return intl.get('FIELD_VELOCITY_X');
    case 'velocity_y':
      return intl.get('FIELD_VELOCITY_Y');
    case 'velocity_z':
      return intl.get('FIELD_VELOCITY_Z');
    case 'displacement_x':
      return intl.get('FIELD_DISPLACEMENT_X');
    case 'displacement_y':
      return intl.get('FIELD_DISPLACEMENT_Y');
    case 'displacement_z':
      return intl.get('FIELD_DISPLACEMENT_Z');
    case 'enveloping_x':
      return intl.get('FIELD_ENVELOPING_X');
    case 'enveloping_y':
      return intl.get('FIELD_ENVELOPING_Y');
    case 'enveloping_z':
      return intl.get('FIELD_ENVELOPING_Z');
    case 'crest_factor_x':
      return intl.get('FIELD_CREST_FACTOR_X');
    case 'crest_factor_y':
      return intl.get('FIELD_CREST_FACTOR_Y');
    case 'crest_factor_z':
      return intl.get('FIELD_CREST_FACTOR_Z');
    default:
      return intl.get('FIELD_UNKOWN');
  }
}

export const FIRST_CLASS_PROPERTIES = [
  { typeId: DeviceType.BoltLoosening, properties: ['loosening_angle', 'attitude', 'motion'] },
  { typeId: DeviceType.BoltElongation, properties: ['preload', 'pressure', 'temperature'] },
  {
    typeId: DeviceType.BoltElongationMultiChannels,
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
  { typeId: DeviceType.PressureTemperature, properties: ['pressure', 'temperature'] },
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
  { typeId: DeviceType.Temperature, properties: ['temperature'] }
];
