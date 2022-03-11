import { DeviceType } from './device_type';
import { Property } from './property';
import { AlertState } from './alert_state';
import { Network } from './network';

export type Device = {
  id: number;
  name: string;
  macAddress: string;
  typeId: DeviceType;
  asset: { id: number; name: string };
  settings: any[];
  state?: any;
  upgradeStatus?: any;
  alertState?: AlertState;
  network?: Network;
  information?: any;
  properties: Property[];
  dataTypes: number[];
  data?: any;
  alertStates?: { rule: { id: number; level: number }; record: { id: number; value: number } }[];
};
