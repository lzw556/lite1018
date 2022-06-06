package process

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type Hello struct {
	networkRepo dependency.NetworkRepository
}

func NewHello() Processor {
	return newRoot(&Hello{
		networkRepo: repository.Network{},
	})
}

func (p Hello) Name() string {
	return "Hello"
}

func (p Hello) Next() Processor {
	return nil
}

func (p Hello) Process(ctx *iot.Context, msg iot.Message) error {
	if value, ok := ctx.Get(msg.Body.Device); ok {
		device := (value).(entity.Device)
		network, err := p.networkRepo.Get(context.TODO(), device.NetworkID)
		if err != nil {
			return err
		}
		command.SyncNetworkLinkStates(network)
	}
	return nil
}
