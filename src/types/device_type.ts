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
  VibrationTemperature3Axis = 327938,
  VibrationTemperature3AxisAdvanced = 327940,
  VibrationTemperature3AxisNB = 327941,
  VibrationTemperature3AxisAdvancedNB = 327942,
  VibrationTemperature3Axis16G = 327943,
  VibrationTemperature3AxisWIRED = 328193,
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
      case DeviceType.VibrationTemperature3Axis:
        return 'DEVICE_TYPE_VIBRATION';
      case DeviceType.VibrationTemperature3AxisNB:
        return 'DEVICE_TYPE_VIBRATION_NB';
      case DeviceType.VibrationTemperature3AxisAdvanced:
        return 'DEVICE_TYPE_VIBRATION_PRO';
      case DeviceType.VibrationTemperature3AxisAdvancedNB:
        return 'DEVICE_TYPE_VIBRATION_PRO_NB';
      case DeviceType.VibrationTemperature3Axis16G:
        return 'DEVICE_TYPE_VIBRATION_16G';
      case DeviceType.VibrationTemperature3AxisWIRED:
        return 'DEVICE_TYPE_WIRED_VIBRATION';
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

  export function sensors() {
    return [
      DeviceType.BoltLoosening,
      DeviceType.BoltLooseningWIRED,
      DeviceType.BoltElongation,
      DeviceType.BoltElongation4Channels,
      DeviceType.BoltElongation8Channels,
      DeviceType.NormalTemperatureCorrosion,
      DeviceType.HighTemperatureCorrosion,
      DeviceType.VibrationTemperature3Axis,
      DeviceType.VibrationTemperature3AxisAdvanced,
      DeviceType.VibrationTemperature3AxisNB,
      DeviceType.VibrationTemperature3AxisAdvancedNB,
      DeviceType.VibrationTemperature3Axis16G,
      DeviceType.VibrationTemperature3AxisWIRED,
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
      type === DeviceType.VibrationTemperature3AxisWIRED ||
      type === DeviceType.TemperatureWIRED ||
      type === DeviceType.PressureTemperatureWIRED ||
      (isMultiChannel(type) as boolean)
    );
  }
}
