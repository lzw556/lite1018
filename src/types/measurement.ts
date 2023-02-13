import { Asset } from './asset';
import { Display } from './display';
import { MeasurementData } from './measurement_data';
import { Device } from './device';

export type Measurement = {
  id: number;
  name: string;
  type: number;
  display?: Display;
  data?: MeasurementData;
  alert?: { level: number };
  asset?: Asset;
  settings?: any;
  sensorSettings?: any;
  pollingPeriod: number;
  mode: number;
  devices: Device[];
};

export namespace Measurement {
  export function getPrimaryFields(m: Measurement) {
    if (m.data) {
      return m.data.fields?.filter((item) => item.primary);
    }
  }
}
