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
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"time"
)

type LinkStatus struct {
	deviceRepo      dependency.DeviceRepository
	deviceStateRepo dependency.DeviceStateRepository
	eventRepo       dependency.EventRepository
}

func NewLinkStatus() Processor {
	return newRoot(LinkStatus{
		deviceRepo:      repository.Device{},
		deviceStateRepo: repository.DeviceState{},
		eventRepo:       repository.Event{},
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

	device, err := p.deviceRepo.GetBySpecs(context.TODO(), spec.DeviceMacEqSpec(linkStatus.Address))
	if err != nil {
		return err
	}

	deviceState, err := p.deviceStateRepo.Get(device.MacAddress)
	if err != nil {
		return fmt.Errorf("device [%s] not found: %v", linkStatus.Address, err)
	}
	isOnline := linkStatus.State == "online"
	isChanged := deviceState.IsOnline != isOnline
	deviceState.IsOnline = isOnline
	if deviceState.IsOnline {
		deviceState.ConnectedAt = time.Now().UTC().Unix()
	}
	if err := p.deviceStateRepo.Create(linkStatus.Address, deviceState); err != nil {
		return fmt.Errorf("update device state failed: %v", err)
	}

	if isChanged {
		deviceState.Notify(linkStatus.Address)
		device.State = deviceState
		go p.addEvent(device, linkStatus.StateUpdateTime)
	}
	return nil
}

func (p LinkStatus) addEvent(device entity.Device, timestamp int64) {
	event := entity.Event{
		Code:      entity.EventCodeStatus,
		SourceID:  device.ID,
		Category:  entity.EventCategoryDevice,
		Timestamp: timestamp,
		ProjectID: device.ProjectID,
	}
	if device.State.IsOnline {
		event.Content = fmt.Sprintf(`{"code": %d}`, 1)
	} else {
		event.Content = fmt.Sprintf(`{"code": %d}`, 0)
	}
	_ = p.eventRepo.Create(context.TODO(), &event)
}
