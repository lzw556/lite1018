package devicetype

type Gateway struct {
	IpMode       Setting `json:"ip_mode"`
	IpAddr       Setting `json:"ip_addr"`
	SubnetMask   Setting `json:"subnet_mask"`
	GatewayAddr  Setting `json:"gateway_addr"`
	NtpIsEnabled Setting `json:"ntp_is_enabled"`
	NtpAddr      Setting `json:"ntp_addr"`
}

func (Gateway) ID() uint {
	return GatewayType
}

func (Gateway) SensorID() uint {
	return 0
}

func (d Gateway) Settings() Settings {
	d.IpMode = Setting{
		Name:  "IP模式",
		Key:   "ip_mode",
		Type:  Uint8ValueType,
		Value: 0, // 0: DHCP 1: Static
		Options: map[int]string{
			0: "DHCP",
			1: "静态",
		},
		Category: IpnSettingCategory,
		Sort:     0,
		Group:    SettingGroupNetwork,
	}
	d.IpAddr = Setting{
		Name:     "IP地址",
		Key:      "ip_addr",
		Type:     StringValueType,
		Value:    "192.168.1.100",
		Category: IpnSettingCategory,
		Sort:     1,
		Parent:   d.IpMode.Key,
		Show:     1,
		Group:    SettingGroupNetwork,
	}
	d.SubnetMask = Setting{
		Name:     "子网掩码",
		Key:      "subnet_mask",
		Type:     StringValueType,
		Value:    "255.255.255.0",
		Category: IpnSettingCategory,
		Sort:     2,
		Show:     1,
		Parent:   d.IpMode.Key,
		Group:    SettingGroupNetwork,
	}
	d.GatewayAddr = Setting{
		Name:     "网关地址",
		Key:      "gateway_addr",
		Type:     StringValueType,
		Value:    "192.168.1.1",
		Category: IpnSettingCategory,
		Sort:     3,
		Show:     1,
		Parent:   d.IpMode.Key,
		Group:    SettingGroupNetwork,
	}
	d.NtpIsEnabled = Setting{
		Name:     "是否启用NTP",
		Key:      "ntp_is_enabled",
		Type:     BoolValueType,
		Value:    true, // 0: Disable 1: Enable
		Category: IpnSettingCategory,
		Sort:     6,
		Group:    SettingGroupNetwork,
	}
	d.NtpAddr = Setting{
		Name:     "NTP服务器地址",
		Key:      "ntp_addr",
		Type:     StringValueType,
		Value:    "ntp1.aliyun.com",
		Category: IpnSettingCategory,
		Sort:     7,
		Parent:   d.NtpIsEnabled.Key,
		Show:     true,
		Group:    SettingGroupNetwork,
	}
	return []Setting{
		d.IpMode,
		d.IpAddr,
		d.SubnetMask,
		d.GatewayAddr,
		d.NtpIsEnabled,
		d.NtpAddr,
	}
}

func (Gateway) Properties(sensorID uint) Properties {
	return nil
}
