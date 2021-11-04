package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
)

type DeviceUpgradeCmd struct {
	entity.Device
	Gateway entity.Device

	firmwareRepo dependency.FirmwareRepository
}

func NewDeviceUpgradeCmd() DeviceUpgradeCmd {
	return DeviceUpgradeCmd{
		firmwareRepo: repository.Firmware{},
	}
}

func (cmd DeviceUpgradeCmd) Upgrade(req request.DeviceUpgrade) error {
	firmware, err := cmd.firmwareRepo.Get(context.TODO(), req.FirmwareID)
	if err != nil {
		return response.BusinessErr(errcode.FirmwareNotFoundError, "")
	}

	return command.DeviceUpgrade(cmd.Gateway, cmd.Device, firmware)
}

func (cmd DeviceUpgradeCmd) CancelUpgrade() error {
	return command.CancelDeviceUpgrade(cmd.Gateway, cmd.Device)
}
