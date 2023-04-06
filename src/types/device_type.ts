export enum DeviceType {
  Gateway = 1,
  Router = 257,
  BoltLoosening = 131073,
  BoltElongation = 196609,
  BoltElongation4Channels = 196611,
  BoltElongation8Channels = 196612,
  NormalTemperatureCorrosion = 262145,
  HighTemperatureCorrosion = 262401,
  VibrationTemperature3Axis = 327938,
  VibrationTemperature3AxisAdvanced = 327940,
  VibrationTemperature3AxisNB = 327941,
  VibrationTemperature3AxisAdvancedNB = 327942,
  Temperature = 393217,
  Pressure = 524289,
  PressureTemperature = 524290,
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
      case DeviceType.HighTemperatureCorrosion:
        return 'DEVICE_TYPE_HIGH_TEMPATURE_CORROSION';
      case DeviceType.NormalTemperatureCorrosion:
        return 'DEVICE_TYPE_CORROSION';
      case DeviceType.VibrationTemperature3Axis:
        return 'DEVICE_TYPE_VIBRATION';
      case DeviceType.VibrationTemperature3AxisNB:
        return 'DEVICE_TYPE_VIBRATION_NB';
      case DeviceType.VibrationTemperature3AxisAdvanced:
        return 'DEVICE_TYPE_VIBRATION_PRO';
      case DeviceType.VibrationTemperature3AxisAdvancedNB:
        return 'DEVICE_TYPE_VIBRATION_PRO_NB';
      case DeviceType.Temperature:
        return 'DEVICE_TYPE_TEMPERATURE';
      case DeviceType.Pressure:
        return 'DEVICE_TYPE_PRESSURE';
      case DeviceType.PressureTemperature:
        return 'DEVICE_TYPE_PRESSURE_TEMPERATURE';
      case DeviceType.AngleDip:
        return 'DEVICE_TYPE_INCLINATION';
      case DeviceType.AngleDipNB:
        return 'DEVICE_TYPE_INCLINATION_NB';
      default:
        return 'DEVICE_TYPE_UNKNOWN';
    }
  }

  export function sensors() {
    return [
      DeviceType.BoltLoosening,
      DeviceType.BoltElongation,
      DeviceType.BoltElongation4Channels,
      DeviceType.BoltElongation8Channels,
      DeviceType.NormalTemperatureCorrosion,
      DeviceType.HighTemperatureCorrosion,
      DeviceType.VibrationTemperature3Axis,
      DeviceType.VibrationTemperature3AxisAdvanced,
      DeviceType.VibrationTemperature3AxisNB,
      DeviceType.VibrationTemperature3AxisAdvancedNB,
      DeviceType.Temperature,
      DeviceType.Pressure,
      DeviceType.PressureTemperature,
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
}
