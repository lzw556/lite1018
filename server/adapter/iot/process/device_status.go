package process

import (
	"context"
	"fmt"
	"github.com/gogo/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"time"
)

type DeviceStatus struct {
	repository  dependency.DeviceStateRepository
	networkRepo dependency.NetworkRepository
	deviceRepo  dependency.DeviceRepository
	eventRepo   dependency.EventRepository
}

func NewDeviceStatus() Processor {
	return newRoot(DeviceStatus{
		repository:  repository.DeviceState{},
		networkRepo: repository.Network{},
		deviceRepo:  repository.Device{},
		eventRepo:   repository.Event{},
	})
}

func (p DeviceStatus) Name() string {
	return "DeviceState"
}

func (DeviceStatus) Next() Processor {
	return nil
}

func (p DeviceStatus) Process(ctx *iot.Context, msg iot.Message) error {
	if value, ok := ctx.Get(msg.Body.Device); ok {
		if device, ok := value.(entity.Device); ok {
			m := pd.DeviceStatusMessage{}
			if err := proto.Unmarshal(msg.Body.Payload, &m); err != nil {
				return fmt.Errorf("unmarshal [DeviceState] message failed： %v", err)
			}
			var e entity.DeviceState
			if err := json.Unmarshal([]byte(m.Status), &e); err != nil {
				return fmt.Errorf("unmarshal device %s status %s failed: %v", device.MacAddress, m.Status, err)
			}
			state, _ := p.repository.Get(device.MacAddress)
			state.ConnectedAt = time.Now().Unix()
			state.BatteryVoltage = e.BatteryVoltage
			state.BatteryLevel = e.BatteryLevel
			state.SignalLevel = e.SignalLevel
			state.AcquisitionIsEnabled = e.AcquisitionIsEnabled
			if device.IsGateway() {
				state.SetIsOnline(true)
				state.Notify(device.MacAddress)
				if device.IsGateway() && state.ConnectionStatusChanged {
					if network, err := p.networkRepo.Get(context.TODO(), device.NetworkID); err == nil {
						go command.SyncNetworkLinkStates(network, 3*time.Second)
					}
				}
				p.addDeviceOnlineEvent(device)
			}
			if err := p.repository.Create(device.MacAddress, state); err != nil {
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
