package command

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type DeviceExecuteCommandCmd struct {
	entity.Device
	Gateway entity.Device
}

func NewDeviceExecuteCommandCmd() DeviceExecuteCommandCmd {
	return DeviceExecuteCommandCmd{}
}

func (cmd DeviceExecuteCommandCmd) Run(cmdType uint) error {
	return command.Execute(cmd.Gateway, cmd.Device, command.Type(cmdType))
}
