package command

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type DeviceExecuteCommandCmd struct {
	entity.Device
	Gateway entity.Device

	deviceStateRepo dependency.DeviceStateRepository
}

func NewDeviceExecuteCommandCmd() DeviceExecuteCommandCmd {
	return DeviceExecuteCommandCmd{
		deviceStateRepo: repository.DeviceState{},
	}
}

func (cmd DeviceExecuteCommandCmd) Run(cmdType uint) error {
	cmd.Gateway.State, _ = cmd.deviceStateRepo.Get(cmd.Gateway.MacAddress)
	return command.Execute(cmd.Gateway, cmd.Device, command.Type(cmdType))
}
