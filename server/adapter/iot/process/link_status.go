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
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
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
	xlog.Debugf("received [LinkStatus] message: %+v", linkStatus)

	device, err := p.deviceRepo.GetBySpecs(context.TODO(), spec.DeviceMacEqSpec(linkStatus.Address))
	if err != nil {
		return err
	}

	deviceState, _ := p.deviceStateRepo.Get(device.MacAddress)

	// 2 offline 4 reconnecting failed
	isOnline := linkStatus.State == "online"

	deviceState.SetIsOnline(isOnline)
	deviceState.ConnectedAt = time.Now().Unix()
	_ = p.deviceStateRepo.Create(linkStatus.Address, deviceState)

	if deviceState.ConnectionStatusChanged {
		deviceState.Notify(linkStatus.Address)
	}
	p.addEvent(device, deviceState.ConnectedAt, int32(linkStatus.Param))
	return nil
}

func (p LinkStatus) addEvent(device entity.Device, timestamp int64, code int32) {
	event := entity.Event{
		Code:      entity.EventCodeStatus,
		SourceID:  device.ID,
		Category:  entity.EventCategoryDevice,
		Timestamp: timestamp,
		ProjectID: device.ProjectID,
		Content:   fmt.Sprintf(`{"code": %d}`, code),
	}
	if err := p.eventRepo.Create(context.TODO(), &event); err != nil {
		xlog.Errorf("create event failed: %v", err)
	}
}
