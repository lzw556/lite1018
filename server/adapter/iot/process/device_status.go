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
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"time"
)

type DeviceStatus struct {
	repository            dependency.DeviceStateRepository
	networkRepo           dependency.NetworkRepository
	deviceRepo            dependency.DeviceRepository
	eventRepo             dependency.EventRepository
	deviceStatusRepo      dependency.DeviceStateRepository
	deviceConnectionState dependency.DeviceConnectionStateRepository
}

func NewDeviceStatus() Processor {
	return newRoot(DeviceStatus{
		repository:            repository.DeviceState{},
		networkRepo:           repository.Network{},
		deviceRepo:            repository.Device{},
		eventRepo:             repository.Event{},
		deviceStatusRepo:      repository.DeviceState{},
		deviceConnectionState: repository.DeviceConnectionState{},
	})
}

func (p DeviceStatus) Name() string {
	return "DeviceStatus"
}

func (DeviceStatus) Next() Processor {
	return nil
}

func (p DeviceStatus) Process(ctx *iot.Context, msg iot.Message) error {
	if value, ok := ctx.Get(msg.Body.Device); ok {
		if device, ok := value.(entity.Device); ok {
			m := pd.DeviceStatusMessage{}
			if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
				return fmt.Errorf("unmarshal [DeviceStatus] message failed： %v", err)
			}
			var e entity.DeviceStatus
			if err := json.Unmarshal([]byte(m.Status), &e); err != nil {
				return fmt.Errorf("unmarshal device %s status %s failed: %v", device.MacAddress, m.Status, err)
			}
			e.Timestamp = time.Now().Unix()
			_ = p.deviceStatusRepo.Create(device.MacAddress, e)

			connectionState, err := p.deviceConnectionState.Get(device.MacAddress)
			if err != nil {
				xlog.Errorf("get device connection state failed: %v => [%s]", err, device.MacAddress)
			}
			if connectionState == nil {
				connectionState = entity.NewDeviceConnectionState()
			}
			connectionState.SetIsOnline(true)
			if connectionState.IsStatusChanged {
				connectionState.Notify(device.MacAddress)
				p.addDeviceOnlineEvent(device)
			}
			if err := p.deviceConnectionState.Update(device.MacAddress, connectionState); err != nil {
				return fmt.Errorf("save device status failed: %v", err)
			}
		}
	}
	return nil
}

func (p DeviceStatus) addDeviceOnlineEvent(device entity.Device) {
	event := entity.Event{
		Code:      entity.EventCodeStatus,
		SourceID:  device.ID,
		Category:  entity.EventCategoryDevice,
		Timestamp: time.Now().Unix(),
		ProjectID: device.ProjectID,
		Content:   fmt.Sprintf(`{"code": %d}`, 0),
	}
	_ = p.eventRepo.Create(context.TODO(), &event)
}
