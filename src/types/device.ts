import { DeviceType } from './device_type';
import { Property } from './property';
import { Network } from './network';

export type Device = {
  id: number;
  name: string;
  ipAddress: string;
  ipPort: number;
  pollingPeriod: number;
  macAddress: string;
  parent: string;
  typeId: DeviceType;
  asset: { id: number; name: string };
  settings: any[];
  state?: any;
  upgradeStatus?: any;
  alertStates?: { rule: { id: number; level: number }; record: { id: number; value: number } }[];
  network?: Network;
  information?: any;
  properties: Property[];
  dataTypes: number[];
  data?: any;
  tag?: string;
};
