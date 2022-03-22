package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"time"
)

type NetworkCommandCmd struct {
	entity.Network

	deviceRepo      dependency.DeviceRepository
	deviceStateRepo dependency.DeviceStateRepository
}

func NewNetworkCommandCmd() NetworkCommandCmd {
	return NetworkCommandCmd{
		deviceRepo:      repository.Device{},
		deviceStateRepo: repository.DeviceState{},
	}
}

func (cmd NetworkCommandCmd) Sync() error {
	ctx := context.TODO()
	devices, err := cmd.deviceRepo.FindBySpecs(ctx, spec.NetworkEqSpec(cmd.Network.ID))
	if err != nil {
		return err
	}
	return command.SyncNetwork(cmd.Network, devices, 3*time.Second)
}

func (cmd NetworkCommandCmd) Provision() error {
	ctx := context.TODO()
	gateway, err := cmd.deviceRepo.Get(ctx, cmd.Network.GatewayID)
	if err != nil {
		return response.BusinessErr(errcode.DeviceNotFoundError, err.Error())
	}
	gateway.State, err = cmd.deviceStateRepo.Get(gateway.MacAddress)
	if err != nil {
		return response.BusinessErr(errcode.DeviceOfflineError, err.Error())
	}
	return command.Execute(gateway, gateway, command.ProvisionCmdType)
}
