package job

import (
	"context"
	"fmt"
	"github.com/robfig/cron/v3"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
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
	xlog.Debugf("start running network job => [%s]", j.Network.Name)
	if gateway, err := j.deviceRepo.Get(context.TODO(), j.Network.GatewayID); err == nil {
		if state, err := j.deviceStateRepo.Get(gateway.MacAddress); err == nil {
			if state.IsOnline && (time.Now().UTC().Unix()-state.ConnectedAt)/int64(j.Network.CommunicationPeriod) > 3 {
				xlog.Debugf("network gateway offline 3 periods => [%s]", j.Network.Name)
			}
		}
	}
}
