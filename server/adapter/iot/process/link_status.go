package process

import (
	"context"
	"fmt"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

type LinkStatus struct {
	deviceRepo dependency.DeviceRepository
}

func NewLinkStatus() Processor {
	return newRoot(LinkStatus{
		deviceRepo: repository.Device{},
	})
}

func (p LinkStatus) Name() string {
	return "LinkStatus"
}

func (p LinkStatus) Next() Processor {
	return nil
}

func (p LinkStatus) Process(ctx *iot.Context, msg iot.Message) error {
	m := pd.LinkStatusMessage{}
	if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
		return fmt.Errorf("unmarshal [LinkStatus] message failed: %v", err)
	}
	linkStatus := po.LinkStatus{}
	if err := json.Unmarshal([]byte(m.Status), &linkStatus); err != nil {
		return err
	}
	device, err := p.deviceRepo.GetBySpecs(context.TODO(), spec.DeviceMacEqSpec(linkStatus.Address))
	if err != nil {
		return fmt.Errorf("device [%s] not found: %v", linkStatus.Address, err)
	}
	device.UpdateConnectionState(linkStatus.State == "online")
	return nil
}
