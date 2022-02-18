package process

import (
	"fmt"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"time"
)

type LinkStatus struct {
	deviceRepo      dependency.DeviceRepository
	deviceStateRepo dependency.DeviceStateRepository
}

func NewLinkStatus() Processor {
	return newRoot(LinkStatus{
		deviceRepo:      repository.Device{},
		deviceStateRepo: repository.DeviceState{},
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
	linkStatus := entity.LinkStatus{}
	if err := json.Unmarshal([]byte(m.Status), &linkStatus); err != nil {
		return err
	}
	deviceState, err := p.deviceStateRepo.Get(linkStatus.Address)
	if err != nil {
		return fmt.Errorf("device [%s] not found: %v", linkStatus.Address, err)
	}
	deviceState.IsOnline = linkStatus.State == "online"
	if deviceState.IsOnline {
		deviceState.ConnectedAt = time.Now().UTC().Unix()
	}
	if err := p.deviceStateRepo.Create(linkStatus.Address, deviceState); err != nil {
		return fmt.Errorf("update device state failed: %v", err)
	}
	deviceState.Notify(linkStatus.Address)
	return nil
}
