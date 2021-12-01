package cron

import (
	"context"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/task"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"time"
)

type Network struct {
	entity.Network

	deviceRepo dependency.DeviceRepository
}

func NewNetwork(n entity.Network) task.Job {
	return Network{
		Network:    n,
		deviceRepo: repository.Device{},
	}
}

func (n Network) ID() string {
	return fmt.Sprintf("network-%d", n.Network.ID)
}

func (n Network) Spec() string {
	duration := time.Duration(n.Network.CommunicationPeriod+n.Network.CommunicationTimeOffset) * time.Millisecond
	return fmt.Sprintf("@every %s", duration.String())
}

func (n Network) Run() {
	xlog.Infof("start running network job => [%d-%s]", n.Network.ID, n.Network.Name)
	devices, err := n.deviceRepo.FindBySpecs(context.TODO(), spec.NetworkEqSpec(n.Network.ID))
	if err != nil {
		xlog.Errorf("run network %d job failed: %v", n.Network.ID, err)
	}
	for _, device := range devices {
		go n.checkDeviceStatus(device)
	}
}

func (n Network) checkDeviceStatus(e entity.Device) {
	now := time.Now()
	diff := time.Duration(now.Unix()-e.GetConnectionState().ConnectedAt) * time.Second
	isOnline := diff-time.Duration(n.Network.CommunicationPeriod*3)*time.Millisecond < 0
	e.UpdateConnectionState(isOnline)
}
