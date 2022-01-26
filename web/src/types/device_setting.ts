import {COMMUNICATION_PERIOD, COMMUNICATION_TIME_OFFSET} from "../constants";
import {WsnSetting} from "./wsn_setting";
import {IpnSetting} from "./ipn_setting";

export const DEFAULT_DEVICE_SETTING_IPN: IpnSetting = {
    ip_mode: 0,
    ip_addr: "192.168.1.100",
    subnet_mask: "255.255.255.0",
    gateway_addr: "192.168.1.1",
    ntp_is_enabled: true,
    ntp_addr: "ntp1.aliyun.com"
}

export const DEFAULT_WSN_SETTING: WsnSetting = {
    communication_period: COMMUNICATION_PERIOD[0].value,
    communication_time_offset: COMMUNICATION_TIME_OFFSET[0].value,
    group_size: 4,
    group_interval: 2 * 60 * 1000
}

export enum DeviceSettingValueType {
    uint8 = "uint8",
    uint16 = "uint16",
    uint32 = "uint32",
    uint64 = "uint64",
    float = "float",
    string = "string",
    bool = "bool"
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
}