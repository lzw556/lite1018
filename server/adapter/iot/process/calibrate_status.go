package process

import (
	"fmt"
	"github.com/golang/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type CalibrateStatus struct {
}

func NewCalibrateStatus() Processor {
	return newRoot(
		&CalibrateStatus{},
	)
}

func (p CalibrateStatus) Name() string {
	return "CalibrateStatus"
}

func (p CalibrateStatus) Next() Processor {
	return nil
}

func (p CalibrateStatus) Process(ctx *iot.Context, msg iot.Message) error {
	if value, ok := ctx.Get(msg.Body.Device); ok {
		if device, ok := value.(entity.Device); ok {
			fmt.Println(device)
			m := pd.CalibrateStatusMessage{}
			if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
				return fmt.Errorf("unmarshal [CalibrateStatus] message failed： %v", err)
			}
			fmt.Println(m)
		}
	}
	return nil
}
