package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type SensorCreateCmd struct {
	po.Device

	deviceRepo dependency.DeviceRepository
}

func NewSensorCreateCmd() SensorCreateCmd {
	return SensorCreateCmd{
		deviceRepo: repository.Device{},
	}
}

func (cmd SensorCreateCmd) Run() error {
	err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		return cmd.deviceRepo.Create(txCtx, &cmd.Device)
	})
	return err
}
