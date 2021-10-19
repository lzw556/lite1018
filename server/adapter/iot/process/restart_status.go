package process

import (
	"context"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"time"
)

type RestartStatus struct {
	deviceRepo  dependency.DeviceRepository
	networkRepo dependency.NetworkRepository
}

func NewRestartStatus() Processor {
	return newRoot(RestartStatus{
		deviceRepo:  repository.Device{},
		networkRepo: repository.Network{},
	})
}

func (p RestartStatus) Name() string {
	return "RestartStatus"
}

func (p RestartStatus) Next() Processor {
	return nil
}

func (p RestartStatus) Process(ctx *iot.Context, msg iot.Message) error {
	if value, ok := ctx.Get(msg.Body.Gateway); ok {
		if gateway, ok := value.(entity.Device); ok {
			c := context.TODO()
			network, err := p.networkRepo.Get(c, gateway.NetworkID)
			if err != nil {
				return fmt.Errorf("network not found: %v", err)
			}
			devices, err := p.deviceRepo.FindBySpecs(c, spec.NetworkSpec(network.ID))
			if err != nil {
				return fmt.Errorf("find device list failed: %v", err)
			}
			if iot.SyncWsnSettings(network, gateway, false, 3*time.Second) {
				iot.SyncDeviceList(gateway, devices, 5*time.Second)
			}
		}
	}
	return nil
}
