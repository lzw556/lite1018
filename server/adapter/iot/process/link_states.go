package process

import (
	"context"
	"time"

	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"github.com/thetasensors/theta-cloud-lite/server/worker"
)

type LinkStates struct {
	deviceRepo dependency.DeviceRepository
}

func NewLinkStates() LinkStates {
	return LinkStates{
		deviceRepo: repository.Device{},
	}
}

func (p LinkStates) Name() string {
	return "LinkStates"
}

func (p LinkStates) Next() Processor {
	return nil
}

func (p LinkStates) Process(ctx *iot.Context, msg iot.Message) error {
	m := pd.LinkStatesMessage{}
	if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
		xlog.Errorf("unmarshal [%s] message failed: %v", p.Name(), err)
		return err
	}
	var result []struct {
		Mac   string `json:"mac"`
		State int    `json:"state"`
	}
	if err := json.Unmarshal([]byte(m.States), &result); err != nil {
		xlog.Errorf("unmarshal [AllStatus] failed:%v", err)
		return err
	}
	for i := range result {
		r := result[i]
		if r.Mac != msg.Body.Gateway {
			oldState, _, _ := cache.GetConnection(r.Mac)
			newState := r.State > 1
			if oldState != newState {
				eventbus.Publish(eventbus.SocketEmit, "socket::deviceStateChangedEvent", map[string]interface{}{
					"macAddress": r.Mac,
					"state": map[string]interface{}{
						"isOnline":    newState,
						"connectedAt": time.Now().Unix(),
					},
				})
				go func(isOnline bool) {
					if device, err := p.deviceRepo.GetBySpecs(context.TODO(), spec.DeviceMacEqSpec(r.Mac)); err == nil {
						event := entity.Event{
							Type:      entity.EventTypeDeviceStatus,
							Category:  entity.EventCategoryDevice,
							SourceID:  device.ID,
							Timestamp: time.Now().Unix(),
							ProjectID: device.ProjectID,
						}
						event.Code = 0
						if !isOnline {
							event.Code = 2
						}
						worker.EventsChan <- event
					}
				}(newState)
				cache.SetConnection(r.Mac, newState)
			}
		}
	}
	return nil
}
