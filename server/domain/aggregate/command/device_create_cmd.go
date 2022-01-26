package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
)

type DeviceCreateCmd struct {
	po.Device

	deviceRepo dependency.DeviceRepository
}

func NewDeviceCreateCmd() DeviceCreateCmd {
	return DeviceCreateCmd{
		deviceRepo: repository.Device{},
	}
}

func (cmd DeviceCreateCmd) Run() error {
	return cmd.deviceRepo.Create(context.TODO(), &cmd.Device)
}
