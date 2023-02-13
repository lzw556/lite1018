export type IpnSetting = {
  ip_mode: number;
  ip_addr?: string;
  subnet_mask?: string;
  gateway_addr?: string;
  ntp_is_enabled: boolean;
  ntp_addr?: string;
};

export const DEFAULT_IPN_SETTING: IpnSetting = {
  ip_mode: 0,
  ntp_is_enabled: false
};
