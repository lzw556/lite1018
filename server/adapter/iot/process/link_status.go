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
)

type LinkStatus struct {
	deviceRepo                dependency.DeviceRepository
	eventRepo                 dependency.EventRepository
	deviceConnectionStateRepo dependency.DeviceConnectionStateRepository
	deviceLinkStatusRepo      dependency.DeviceLinkStatusRepository
}

func NewLinkStatus() Processor {
	return newRoot(LinkStatus{
		deviceRepo:                repository.Device{},
		eventRepo:                 repository.Event{},
		deviceConnectionStateRepo: repository.DeviceConnectionState{},
		deviceLinkStatusRepo:      repository.DeviceLinkStatus{},
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

	go p.addLinkStatusLog(linkStatus)

	connectionState, err := p.deviceConnectionStateRepo.Get(device.MacAddress)
	if err != nil {
		xlog.Errorf("get device connection state failed: %v => [%s]", err, device.MacAddress)
		return err
	}
	if connectionState == nil {
		connectionState = entity.NewDeviceConnectionState()
	}

	// 2 offline 4 reconnecting failed
	if linkStatus.State != "online" {
		connectionState.SetIsOnline(false)
	}
	_ = p.deviceConnectionStateRepo.Update(device.MacAddress, connectionState)

	connectionState.Notify(linkStatus.Address)
	// 此处不记录设备上线事件, 设备上线事件在deviceStatus中记录
	if !connectionState.IsOnline {
		p.addEvent(device, connectionState.Timestamp, int32(linkStatus.Param))
	}
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

func (p LinkStatus) addLinkStatusLog(linkStatus entity.LinkStatus) {
	e := entity.DeviceLinkStatus{
		MacAddress:             linkStatus.Address,
		LastCall:               linkStatus.LastCall,
		LastConnection:         uint(linkStatus.LastConnection),
		LastProvisioning:       linkStatus.LastProvisioning,
		NumProvisioningRetries: linkStatus.NumProvisioningRetries,
		State:                  linkStatus.State,
		StateUpdateTime:        linkStatus.StateUpdateTime,
		Status:                 linkStatus.Param,
	}
	if err := p.deviceLinkStatusRepo.Create(context.TODO(), &e); err != nil {
		xlog.Errorf("create device link status failed: %v => [%s]", err, linkStatus.Address)
	}
}
