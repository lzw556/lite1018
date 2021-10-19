package response

import "fmt"

//go:generate stringer -type=BusinessErrorCode
type BusinessErrorCode int

func (i BusinessErrorCode) Error() string {
	return fmt.Sprintf("business error code: %d", i)
}

const UnknownBusinessError BusinessErrorCode = 10000

const (
	UserNotFoundError BusinessErrorCode = iota + 10001
	InvalidUsernameOrPasswordError
	InvalidOldPasswordError
	UserExistsError
	InvalidTokenError
)

const (
	AssetNotFoundError BusinessErrorCode = iota + 11001
)

const (
	DeviceNotFoundError BusinessErrorCode = iota + 12001
	DeviceMacExistsError
	UnknownDeviceTypeError
	DeviceCommandSendFailedError
	DeviceCommandSendTimeoutError
	DeviceCommandExecFailedError
	UnknownDeviceCommandTypeError
)

const (
	FirmwareNotFoundError BusinessErrorCode = iota + 13001
	FirmwareFormatError
	FirmwareExistsError
)

const (
	NetworkNotFoundError BusinessErrorCode = iota + 14001
)

const (
	AlarmRuleNameExists BusinessErrorCode = iota + 15001
	AlarmRuleNotFoundError
)

var businessErrorMap = map[BusinessErrorCode]string{
	UnknownBusinessError:           "未知错误",
	UserNotFoundError:              "用户不存在",
	InvalidUsernameOrPasswordError: "用户名或密码错误",
	InvalidOldPasswordError:        "原密码错误",
	UserExistsError:                "用户已存在",
	InvalidTokenError:              "无效的登录凭证",
	AssetNotFoundError:             "资产不存在",
	DeviceNotFoundError:            "设备不存在",
	DeviceMacExistsError:           "设备MAC地址已经存在",
	UnknownDeviceTypeError:         "未知的设备类型",
	DeviceCommandSendFailedError:   "命令发送失败",
	DeviceCommandExecFailedError:   "命令执行失败",
	DeviceCommandSendTimeoutError:  "命令发送超时",
	UnknownDeviceCommandTypeError:  "未知的设备命令",
	NetworkNotFoundError:           "网络不存在",
	FirmwareNotFoundError:          "固件不存在",
	FirmwareFormatError:            "固件格式错误",
	FirmwareExistsError:            "固件已存在",
	AlarmRuleNameExists:            "规则名称已经存在",
	AlarmRuleNotFoundError:         "报警规则不存在",
}

func getErrMessage(code BusinessErrorCode) string {
	if msg, ok := businessErrorMap[code]; ok {
		return msg
	}
	return businessErrorMap[UnknownBusinessError]
}
