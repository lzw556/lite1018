package process

import (
	"context"
	"fmt"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/background"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type RestartStatus struct {
	deviceRepo dependency.DeviceRepository
	eventRepo  dependency.EventRepository
}

func NewRestartStatus() Processor {
	return newRoot(&RestartStatus{
		deviceRepo: repository.Device{},
		eventRepo:  repository.Event{},
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

			// add event
			event := entity.Event{
				Code:      entity.EventCodeReboot,
				SourceID:  device.ID,
				Category:  entity.EventCategoryDevice,
				Timestamp: int64(m.Timestamp),
				Content:   fmt.Sprintf(`{"code":%d}`, m.Code),
				ProjectID: device.ProjectID,
			}
			if err := p.eventRepo.Create(context.TODO(), &event); err != nil {
				return fmt.Errorf("create event failed: %v", err)
			}
			if queue := background.GetTaskQueue(device.MacAddress); queue != nil && !queue.IsRunning() {
				queue.Run()
			}
		}
	}
	return nil
}
