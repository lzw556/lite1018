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
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"time"
)

type DeviceStatus struct {
	repository  dependency.DeviceStateRepository
	networkRepo dependency.NetworkRepository
	deviceRepo  dependency.DeviceRepository
}

func NewDeviceStatus() Processor {
	return newRoot(DeviceStatus{
		repository:  repository.DeviceState{},
		networkRepo: repository.Network{},
		deviceRepo:  repository.Device{},
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
			e.IsOnline = true
			e.ConnectedAt = time.Now().UTC().Unix()
			if err := p.repository.Create(device.MacAddress, e); err != nil {
				return fmt.Errorf("save device status failed: %v", err)
			}
			if _, ok := ctx.Get("sync_network_link_states"); ok {
				c := context.TODO()
				if network, err := p.networkRepo.Get(c, device.NetworkID); err == nil {
					if devices, err := p.deviceRepo.FindBySpecs(c, spec.NetworkEqSpec(network.ID)); err == nil {
						go command.SyncNetworkLinkStatus(network, devices, 3*time.Second)
					}
				}
			}
		}
	}
	return nil
}
