package job

import (
	"fmt"
	"github.com/robfig/cron/v3"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"time"
)

type Network struct {
	entity.Network

	deviceRepo      dependency.DeviceRepository
	deviceStateRepo dependency.DeviceStateRepository
}

func NewNetwork(e entity.Network) *Network {
	return &Network{
		Network:         e,
		deviceRepo:      repository.Device{},
		deviceStateRepo: repository.DeviceState{},
	}
}

func (j Network) ID() string {
	return fmt.Sprintf("network-%d", j.Network.ID)
}

func (j Network) Schedule() cron.Schedule {
	return cron.Every(time.Duration(j.Network.CommunicationPeriod+j.Network.CommunicationTimeOffset) * time.Millisecond)
}

func (j Network) Run() {
}
