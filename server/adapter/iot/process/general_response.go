package process

import (
	"fmt"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
)

type GeneralResponse struct {
}

func NewGeneralResponse() Processor {
	return newRoot(GeneralResponse{})
}

func (p GeneralResponse) Name() string {
	return "GeneralResponse"
}

func (p GeneralResponse) Next() Processor {
	return nil
}

func (p GeneralResponse) Process(ctx *iot.Context, msg iot.Message) error {
	m := pd.GeneralResponseMessage{}
	if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
		return fmt.Errorf("unmarshal [GeneralResponseMessage] failed: %v", err)
	}
	eventbus.Publish(eventbus.DeviceCommandResponse, m)
	return nil
}
