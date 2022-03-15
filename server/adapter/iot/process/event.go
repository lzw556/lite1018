package process

import (
	"context"
	"fmt"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type Event struct {
	eventRepo dependency.EventRepository
}

func NewEvent() Processor {
	return newRoot(&Event{
		eventRepo: repository.Event{},
	})
}

func (p Event) Name() string {
	return "Event"
}

func (p Event) Next() Processor {
	return nil
}

func (p Event) Process(ctx *iot.Context, msg iot.Message) error {
	if value, ok := ctx.Get(msg.Body.Device); ok {
		if device, ok := value.(entity.Device); ok {
			m := pd.EventMessage{}
			if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
				return fmt.Errorf("unmarshal [Event] message failed: %v", err)
			}
			event := entity.Event{
				Code:      entity.EventCodeDataAcquisitionFailed,
				Category:  entity.EventCategoryDevice,
				SourceID:  device.ID,
				Timestamp: int64(m.Timestamp),
				Content:   string(m.Data),
				ProjectID: device.ProjectID,
			}
			if err := p.eventRepo.Create(context.TODO(), &event); err != nil {
				return fmt.Errorf("create [Event] message failed: %v", err)
			}
		}
	}
	return nil
}
