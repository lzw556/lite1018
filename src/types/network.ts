import { Device } from './device';
import { Asset } from './asset';
import intl from 'react-intl-universal';

export type Network = {
  id: number;
  name: string;
  gateway: Device;
  asset: Asset;
  routingTables: [];
  nodes: Device[];
  communicationPeriod: number;
  communicationPeriod2: number;
  communicationOffset: number;
  groupSize: number;
  mode: number;
  groupSize2: number;
  intervalCnt: number;
};

export enum NetworkProvisioningMode {
  Mode1 = 1,
  Mode2
}

export namespace NetworkProvisioningMode {
  export function toString(mode: NetworkProvisioningMode) {
    switch (mode) {
      case NetworkProvisioningMode.Mode2:
        return intl.get('WSN_MODE') + '2';
      default:
        return intl.get('WSN_MODE') + '1';
    }
  }
}
