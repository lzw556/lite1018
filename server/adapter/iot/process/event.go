package process

import (
	"fmt"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type Event struct {
}

func NewEvent() Processor {
	return newRoot(&Event{})
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
			fmt.Println(device)
			m := pd.EventMessage{}
			if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
				return fmt.Errorf("unmarshal [Event] message failed: %v", err)
			}
			fmt.Println(m.Data)
		}
	}
	return nil
}
