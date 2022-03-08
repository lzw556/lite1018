package process

import (
	"context"
	"fmt"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/background"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"golang.org/x/sync/errgroup"
	"time"
)

type RestartStatus struct {
	deviceRepo  dependency.DeviceRepository
	networkRepo dependency.NetworkRepository
	eventRepo   dependency.EventRepository
}

func NewRestartStatus() Processor {
	return newRoot(RestartStatus{
		deviceRepo:  repository.Device{},
		networkRepo: repository.Network{},
		eventRepo:   repository.Event{},
	})
}

func (p RestartStatus) Name() string {
	return "RestartStatus"
}

func (p RestartStatus) Next() Processor {
	return nil
}

func (p RestartStatus) Process(ctx *iot.Context, msg iot.Message) error {
	if value, ok := ctx.Get(msg.Body.Device); ok {
		if device, ok := value.(entity.Device); ok {
			m := pd.GeneralStatusMessage{}
			if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
				return fmt.Errorf("unmarshal [RestartStatus] message failed: %v", err)
			}
			c := context.TODO()
			network, err := p.networkRepo.Get(c, device.NetworkID)
			if err != nil {
				return fmt.Errorf("network not found: %v", err)
			}
			devices, err := p.deviceRepo.FindBySpecs(c, spec.NetworkEqSpec(network.ID))
			if err != nil {
				return fmt.Errorf("find device list failed: %v", err)
			}
			var eg errgroup.Group
			eg.Go(func() error {
				command.SyncNetworkLinkStatus(network, devices, 3*time.Second)
				return nil
			})
			eg.Go(func() error {
				return command.SyncNetwork(network, devices, 3*time.Second)
			})

			// save event
			eg.Go(func() error {
				event := entity.Event{
					Code:      entity.EventCodeReboot,
					SourceID:  device.ID,
					Category:  entity.EventCategoryDevice,
					Timestamp: int64(m.Timestamp),
					Content:   fmt.Sprintf(`{"code":%d}`, m.Code),
					ProjectID: device.ProjectID,
				}
				return p.eventRepo.Create(context.TODO(), &event)
			})
			if err := eg.Wait(); err != nil {
				return fmt.Errorf("syncing network failed: %v", err)
			}
			if queue := background.GetTaskQueue(device.MacAddress); queue != nil && !queue.IsRunning() {
				queue.Run()
			}
		}
	}
	return nil
}
