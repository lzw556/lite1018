import { IpnSetting } from './ipn_setting';
import { SETTING_GROUPS } from '../constants/settingGroup';

export const DEFAULT_DEVICE_SETTING_IPN: IpnSetting = {
  ip_mode: 0,
  ip_addr: '192.168.1.100',
  subnet_mask: '255.255.255.0',
  gateway_addr: '192.168.1.1',
  ntp_is_enabled: true,
  ntp_addr: 'ntp1.aliyun.com'
};

export enum DeviceSettingValueType {
  uint8 = 'uint8',
  uint16 = 'uint16',
  uint32 = 'uint32',
  uint64 = 'uint64',
  float = 'float',
  string = 'string',
  bool = 'bool'
}

export type DeviceSetting = {
  name: string;
  key: string;
  value: any;
  unit: string;
  category: string;
  type: string;
  options?: any;
  show: any;
  children?: DeviceSetting[];
  group?: keyof typeof SETTING_GROUPS;
  validator: any;
};
