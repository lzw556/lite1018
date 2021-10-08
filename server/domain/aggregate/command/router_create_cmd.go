package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
)

type RouterCreateCmd struct {
	po.Device

	deviceRepo dependency.DeviceRepository
}

func NewRouterCreateCmd() RouterCreateCmd {
	return RouterCreateCmd{
		deviceRepo: repository.Device{},
	}
}

func (cmd RouterCreateCmd) Run() error {
	err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		return cmd.deviceRepo.Create(txCtx, &cmd.Device)
	})
	return err
}
