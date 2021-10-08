package command

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"time"
)

type DeviceExecuteCommandCmd struct {
	entity.Device
	Gateway entity.Device
}

func NewDeviceExecuteCommandCmd() DeviceExecuteCommandCmd {
	return DeviceExecuteCommandCmd{}
}

func (cmd DeviceExecuteCommandCmd) Run(cmdType uint) error {
	err := iot.ExecuteCommand(cmd.Gateway.MacAddress, cmd.Device, iot.CommandType(cmdType), 3*time.Second)
	switch err {
	case iot.CommandSendTimeoutError:
		return response.BusinessErr(response.DeviceCommandSendTimeoutError, "")
	case iot.UnknownCommandTypeError:
		return response.BusinessErr(response.UnknownDeviceCommandTypeError, "")
	case iot.CommandExecFailedError:
		return response.BusinessErr(response.DeviceCommandExecFailedError, "")
	}
	switch iot.CommandType(cmdType) {
	case iot.RebootCmdType:
		cmd.Device.UpdateConnectionState(false)
	}
	return nil
}
