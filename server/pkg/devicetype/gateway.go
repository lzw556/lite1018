package devicetype

type Gateway struct{}

func (Gateway) ID() uint {
	return GatewayType
}

func (Gateway) SensorID() uint {
	return 0
}

func (Gateway) Settings() Settings {
	return []Setting{
		{
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
		},
		{
			Name:     "IP地址",
			Key:      "ip_addr",
			Type:     StringValueType,
			Value:    "192.168.1.100",
			Category: IpnSettingCategory,
			Sort:     1,
			Parent:   "ip_mode",
			Show:     1,
			Group:    SettingGroupNetwork,
		},
		{
			Name:     "子网掩码",
			Key:      "subnet_mask",
			Type:     StringValueType,
			Value:    "255.255.255.0",
			Category: IpnSettingCategory,
			Sort:     2,
			Show:     1,
			Parent:   "ip_mode",
			Group:    SettingGroupNetwork,
		},
		{
			Name:     "网关地址",
			Key:      "gateway_addr",
			Type:     StringValueType,
			Value:    "192.168.1.1",
			Category: IpnSettingCategory,
			Sort:     3,
			Show:     1,
			Parent:   "ip_mode",
			Group:    SettingGroupNetwork,
		},
		{
			Name:     "是否启用NTP",
			Key:      "ntp_is_enabled",
			Type:     BoolValueType,
			Value:    true, // 0: Disable 1: Enable
			Category: IpnSettingCategory,
			Sort:     6,
			Group:    SettingGroupNetwork,
		},
		{
			Name:     "NTP服务器地址",
			Key:      "ntp_addr",
			Type:     StringValueType,
			Value:    "ntp1.aliyun.com",
			Category: IpnSettingCategory,
			Sort:     7,
			Parent:   "ntp_is_enabled",
			Show:     true,
			Group:    SettingGroupNetwork,
		},
	}
}

func (Gateway) Properties(sensorID uint) Properties {
	return nil
}
