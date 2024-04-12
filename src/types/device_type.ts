import { PROPERTY_CATEGORIES } from '../constants/properties';

export enum DeviceType {
  Gateway = 1,
  Router = 257,
  BoltLoosening = 131073,
  BoltLooseningWIRED = 131329,
  BoltElongation = 196609,
  BoltElongation4Channels = 196611,
  BoltElongation8Channels = 196612,
  NormalTemperatureCorrosion = 262145,
  HighTemperatureCorrosion = 262401,
  SVT210R = 327938,
  SVT220520 = 327940,
  VibrationTemperature3AxisNB = 327941,
  VibrationTemperature3AxisAdvancedNB = 327942,
  SVT210510 = 327943,
  SVT110 = 327945,
  SVT210RS = 328193,
  SVT210S = 328194,
  SVT220S1 = 328195,
  SVT220S3 = 328196,
  Temperature = 393217,
  TemperatureWIRED = 393473,
  Pressure = 524289,
  PressureGuoDa = 16777217,
  PressureWoErKe = 16777218,
  PressureTemperature = 524290,
  PressureTemperatureWIRED = 524546,
  AngleDip = 589825,
  AngleDipNB = 589826
}

export namespace DeviceType {
  export function toString(type: DeviceType) {
    switch (type) {
      case DeviceType.Gateway:
        return 'DEVICE_TYPE_GATEWAY';
      case DeviceType.Router:
        return 'DEVICE_TYPE_RELAY';
      case DeviceType.BoltElongation:
        return 'DEVICE_TYPE_BOLT_PRELOAD';
      case DeviceType.BoltElongation4Channels:
        return 'DEVICE_TYPE_4_CHANNEL_BOLT_PRELOAD';
      case DeviceType.BoltElongation8Channels:
        return 'DEVICE_TYPE_8_CHANNEL_BOLT_PRELOAD';
      case DeviceType.BoltLoosening:
        return 'DEVICE_TYPE_BOLT_LOOSENING';
      case DeviceType.BoltLooseningWIRED:
        return 'DEVICE_TYPE_WIRED_BOLT_LOOSENING';
      case DeviceType.HighTemperatureCorrosion:
        return 'DEVICE_TYPE_HIGH_TEMPATURE_CORROSION';
      case DeviceType.NormalTemperatureCorrosion:
        return 'DEVICE_TYPE_CORROSION';
      case DeviceType.SVT210R:
        return 'DEVICE_TYPE_SVT210R';
      case DeviceType.VibrationTemperature3AxisNB:
        return 'DEVICE_TYPE_VIBRATION_NB';
      case DeviceType.SVT220520:
        return 'DEVICE_TYPE_SVT220520';
      case DeviceType.VibrationTemperature3AxisAdvancedNB:
        return 'DEVICE_TYPE_VIBRATION_PRO_NB';
      case DeviceType.SVT210510:
        return 'DEVICE_TYPE_SVT210510';
      case DeviceType.SVT110:
        return 'DEVICE_TYPE_SVT110';
      case DeviceType.SVT210S:
        return 'DEVICE_TYPE_SVT210S';
      case DeviceType.SVT210RS:
        return 'DEVICE_TYPE_SVT210RS';
      case DeviceType.SVT220S1:
        return 'DEVICE_TYPE_SVT220S1';
      case DeviceType.SVT220S3:
        return 'DEVICE_TYPE_SVT220S3';
      case DeviceType.Temperature:
        return 'DEVICE_TYPE_TEMPERATURE';
      case DeviceType.TemperatureWIRED:
        return 'DEVICE_TYPE_WIRED_TEMPERATURE';
      case DeviceType.Pressure:
        return 'DEVICE_TYPE_PRESSURE';
      case DeviceType.PressureGuoDa:
        return 'DEVICE_TYPE_GUODA_PRESSURE';
      case DeviceType.PressureWoErKe:
        return 'DEVICE_TYPE_WOERKE_PRESSURE';
      case DeviceType.PressureTemperature:
        return 'DEVICE_TYPE_PRESSURE_TEMPERATURE';
      case DeviceType.PressureTemperatureWIRED:
        return 'DEVICE_TYPE_WIRED_PRESSURE_TEMPERATURE';
      case DeviceType.AngleDip:
        return 'DEVICE_TYPE_INCLINATION';
      case DeviceType.AngleDipNB:
        return 'DEVICE_TYPE_INCLINATION_NB';
      default:
        return 'DEVICE_TYPE_UNKNOWN';
    }
  }

  export function getGateways() {
    return [DeviceType.Gateway];
  }

  export function getRouters() {
    return [DeviceType.Router];
  }

  export function sensors() {
    return [
      DeviceType.BoltLoosening,
      DeviceType.BoltLooseningWIRED,
      DeviceType.BoltElongation,
      DeviceType.BoltElongation4Channels,
      DeviceType.BoltElongation8Channels,
      DeviceType.NormalTemperatureCorrosion,
      DeviceType.HighTemperatureCorrosion,
      DeviceType.SVT210R,
      DeviceType.SVT220520,
      DeviceType.VibrationTemperature3AxisNB,
      DeviceType.VibrationTemperature3AxisAdvancedNB,
      DeviceType.SVT210510,
      DeviceType.SVT110,
      DeviceType.SVT210RS,
      DeviceType.SVT210S,
      DeviceType.SVT220S1,
      DeviceType.SVT220S3,
      DeviceType.Temperature,
      DeviceType.TemperatureWIRED,
      DeviceType.Pressure,
      DeviceType.PressureGuoDa,
      DeviceType.PressureWoErKe,
      DeviceType.PressureTemperature,
      DeviceType.PressureTemperatureWIRED,
      DeviceType.AngleDip,
      DeviceType.AngleDipNB
    ];
  }

  export function isNB(type: DeviceType | undefined) {
    switch (type) {
      case DeviceType.AngleDipNB:
      case DeviceType.VibrationTemperature3AxisNB:
      case DeviceType.VibrationTemperature3AxisAdvancedNB:
        return true;
    }
    return false;
  }

  export function isMultiChannel(type: number): boolean;
  export function isMultiChannel(
    type: number,
    returnChannels: boolean
  ): { label: string; value: number }[];
  export function isMultiChannel(type: number, returnChannels: boolean = false) {
    const channels = [1, 2, 3, 4, 5, 6, 7, 8].map((v) => ({ label: v.toString(), value: v }));
    const is4Channel = type === DeviceType.BoltElongation4Channels;
    const is8Channel = type === DeviceType.BoltElongation8Channels;
    if (returnChannels) {
      if (is4Channel) return channels.filter((c) => c.value < 5);
      if (is8Channel) return channels;
      return [];
    }
    return is4Channel || is8Channel;
  }

  export function isWiredSensor(type: number) {
    return (
      type === DeviceType.BoltLooseningWIRED ||
      type === DeviceType.SVT210RS ||
      type === DeviceType.TemperatureWIRED ||
      type === DeviceType.PressureTemperatureWIRED ||
      type === DeviceType.SVT210S ||
      type === DeviceType.SVT220S1 ||
      type === DeviceType.SVT220S3 ||
      (isMultiChannel(type) as boolean)
    );
  }

  export function isWiredDevice(type: number) {
    return type === DeviceType.Gateway || isWiredSensor(type);
  }

  export function isSPT(type: number) {
    return type === DeviceType.PressureTemperature || type === DeviceType.PressureTemperatureWIRED;
  }

  export function hasDeviceSettings(type: number) {
    return type !== DeviceType.Router;
  }

  export function isRootDevice(type: number) {
    return type === DeviceType.Gateway || isMultiChannel(type) || isNB(type);
  }

  export function isGateway(type: number) {
    return type === DeviceType.Gateway;
  }

  export function isSensor(type: number) {
    return sensors().includes(type);
  }

  export function canSupportingCalibrate(type: number) {
    return (
      type === DeviceType.HighTemperatureCorrosion ||
      type === DeviceType.NormalTemperatureCorrosion ||
      type === DeviceType.BoltElongation ||
      DeviceType.isMultiChannel(type) ||
      type === DeviceType.Pressure ||
      type === DeviceType.PressureGuoDa ||
      type === DeviceType.PressureWoErKe ||
      type === DeviceType.PressureTemperature ||
      type === DeviceType.PressureTemperatureWIRED ||
      DeviceType.isVibration(type)
    );
  }

  export function hasGroupedSettings(type: number) {
    return type === DeviceType.BoltElongation || isMultiChannel(type);
  }

  export function getNonSensorDeviceTypes() {
    return [DeviceType.Gateway, DeviceType.Router];
  }

  export function isVibration(type: DeviceType | undefined) {
    switch (type) {
      case DeviceType.SVT210R:
      case DeviceType.SVT220520:
      case DeviceType.VibrationTemperature3AxisNB:
      case DeviceType.VibrationTemperature3AxisAdvancedNB:
      case DeviceType.SVT210510:
      case DeviceType.SVT110:
      case DeviceType.SVT210RS:
      case DeviceType.SVT210S:
      case DeviceType.SVT220S1:
      case DeviceType.SVT220S3:
        return true;
    }
    return false;
  }
}

export const SENSOR_DISPLAY_PROPERTIES = {
  [DeviceType.BoltLoosening]: PROPERTY_CATEGORIES.SA,
  [DeviceType.BoltLooseningWIRED]: PROPERTY_CATEGORIES.SA,
  [DeviceType.BoltElongation]: PROPERTY_CATEGORIES.SAS,
  [DeviceType.BoltElongation4Channels]: PROPERTY_CATEGORIES.DS,
  [DeviceType.BoltElongation8Channels]: PROPERTY_CATEGORIES.DS,
  [DeviceType.NormalTemperatureCorrosion]: PROPERTY_CATEGORIES.DC_NORMAL,
  [DeviceType.HighTemperatureCorrosion]: PROPERTY_CATEGORIES.DC_HIGH,
  [DeviceType.SVT210R]: PROPERTY_CATEGORIES.SVT210R,
  [DeviceType.SVT210510]: PROPERTY_CATEGORIES.SVT210510,
  [DeviceType.SVT110]: PROPERTY_CATEGORIES.SVT110,
  [DeviceType.SVT220520]: PROPERTY_CATEGORIES.SVT220520,
  [DeviceType.SVT210RS]: PROPERTY_CATEGORIES.SVT210RS,
  [DeviceType.SVT210S]: PROPERTY_CATEGORIES.SVT220S1S3,
  [DeviceType.SVT220S1]: PROPERTY_CATEGORIES.SVT220S1S3,
  [DeviceType.SVT220S3]: PROPERTY_CATEGORIES.SVT220S1S3,
  [DeviceType.Temperature]: PROPERTY_CATEGORIES.ST,
  [DeviceType.PressureTemperature]: PROPERTY_CATEGORIES.SPT,
  [DeviceType.AngleDip]: PROPERTY_CATEGORIES.SQ
};

const SVT_SENSOR_TYPES = [16842753, 16842758, 16842759];

export const SVT_DEVICE_TYPE_SENSOR_TYPE_MAPPING = {
  [DeviceType.SVT210R]: SVT_SENSOR_TYPES[0],
  [DeviceType.SVT220520]: SVT_SENSOR_TYPES[1],
  [DeviceType.VibrationTemperature3AxisNB]: SVT_SENSOR_TYPES[0],
  [DeviceType.VibrationTemperature3AxisAdvancedNB]: SVT_SENSOR_TYPES[1],
  [DeviceType.SVT210510]: SVT_SENSOR_TYPES[0],
  [DeviceType.SVT110]: SVT_SENSOR_TYPES[0],
  [DeviceType.SVT210RS]: SVT_SENSOR_TYPES[0],
  [DeviceType.SVT210S]: SVT_SENSOR_TYPES[0],
  [DeviceType.SVT220S1]: SVT_SENSOR_TYPES[2],
  [DeviceType.SVT220S3]: SVT_SENSOR_TYPES[1]
};
