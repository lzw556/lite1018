package devicetype

import "github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"

type Parameter struct {
	Name  string      `json:"name"`
	Label string      `json:"label"`
	Type  string      `json:"type"`
	Value interface{} `json:"value"`
	Unit  string      `json:"unit"`
}

func GetParameter(id uint) ([]Parameter, error) {
	switch id {
	case GatewayType:
		return []Parameter{
			{Name: "ip_mode", Label: "IP模式", Type: "Int", Value: 1},
			{Name: "ip_addr", Label: "IP地址", Type: "String", Value: "192.168.1.100"},
			{Name: "subnet_mask", Label: "子网掩码", Type: "String", Value: "255.255.255.0"},
			{Name: "gateway_addr", Label: "网关地址", Type: "String", Value: "192.168.1.1"},
			{Name: "ntp_is_enabled", Label: "NTP启用", Type: "Bool", Value: true},
			{Name: "ntp_addr", Label: "NTP地址", Type: "String", Value: "ntp.aliyun.com"},
		}, nil
	case BoltLooseningType:
		return []Parameter{
			{Name: "schedule0_sample_period", Label: "采样周期", Type: "Int", Value: 20 * 60 * 1000, Unit: "ms"},
		}, nil
	case BoltElongationType:
		return []Parameter{
			{Name: "schedule0_sample_period", Label: "采样周期", Type: "Int", Value: 20 * 60 * 1000},
			{Name: "speed_object", Label: "波速", Type: "Float", Value: 6000},
			{Name: "pretightening_is_enabled", Label: "预紧力是否启用", Type: "Bool", Value: true},
			{Name: "initial_pretightening_length", Label: "初始预紧长度", Type: "Float", Value: 0.0, Unit: "mm"},
			{Name: "pretightening_k", Label: "预紧力系数", Type: "Float", Value: 1, Unit: "kN/mm"},
			{Name: "elastic_modulus", Label: "弹性模量", Type: "Float", Value: 210, Unit: "GPa"},
			{Name: "sectional_area", Label: "截面面积", Type: "Float", Value: 1305.462, Unit: "mm^2"},
			{Name: "clamped_length", Label: "有效受力长度", Type: "Float", Value: 215, Unit: "mm"},
		}, nil
	case VibrationTemperature3AxisType:
		return []Parameter{
			{Name: "schedule0_sample_period", Label: "采样周期", Type: "Int", Value: 20 * 60 * 1000, Unit: "ms"},
		}, nil
	case VibrationTemperature1AxisType:
		return []Parameter{
			{Name: "schedule0_sample_period", Label: "采样周期", Type: "Int", Value: 20 * 60 * 1000, Unit: "ms"},
		}, nil
	case NormalTemperatureCorrosionType:
		return []Parameter{
			{Name: "schedule0_sample_period", Label: "采样周期", Type: "Int", Value: 20 * 60 * 1000, Unit: "ms"},
			{Name: "speed_object", Label: "波速", Type: "Float", Value: 6000},
		}, nil
	case HighTemperatureCorrosionType:
		return []Parameter{
			{Name: "schedule0_sample_period", Label: "采样周期", Type: "Int", Value: 20 * 60 * 1000, Unit: "ms"},
			{Name: "speed_object", Label: "波速", Type: "Float", Value: 6000},
			{Name: "length_rod", Label: "导波杆长", Type: "Float", Value: 124},
		}, nil
	case AngleDipType:
		return []Parameter{
			{Name: "schedule0_sample_period", Label: "采样周期", Type: "Int", Value: 20 * 60 * 1000, Unit: "ms"},
		}, nil
	default:
		return nil, errcode.UnknownDeviceTypeError
	}
}
