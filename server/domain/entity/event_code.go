package entity

type EventCode int

const (
	EventCodeError EventCode = iota + 90101
	EventCodeReboot
	EventCodeReset
	EventCodeUpgrade
)

const (
	EventCodeStatus EventCode = 90201 + iota
)

const (
	EventCodeDataAcquisitionFailed EventCode = iota + 90401
)

func (e EventCode) String() string {
	switch e {
	case EventCodeError:
		return "系统错误"
	case EventCodeReboot:
		return "设备重启"
	case EventCodeReset:
		return "恢复出厂设置"
	case EventCodeUpgrade:
		return "设备升级"
	case EventCodeStatus:
		return "设备状态变化"
	case EventCodeDataAcquisitionFailed:
		return "数据采集失败"
	default:
		return "未知错误"
	}
}
