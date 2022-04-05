package command

import (
	"context"
	"encoding/binary"
	"fmt"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/utils"
	"time"
)

type updateDevicesCmd struct {
	request
	gateway  entity.Device
	children []entity.Device
}

func newUpdateDeviceListCmd(gateway entity.Device, children []entity.Device) updateDevicesCmd {
	cmd := updateDevicesCmd{
		gateway:  gateway,
		children: children,
	}
	cmd.request = newRequest()
	return cmd
}

func (updateDevicesCmd) Name() string {
	return "updateDevices"
}

func (cmd updateDevicesCmd) Response() string {
	return "updateDevicesResponse"
}

func (updateDevicesCmd) Qos() byte {
	return 1
}

func (cmd updateDevicesCmd) Payload() []byte {
	m := pd.UpdateDevicesCommand{
		Timestamp: int32(time.Now().Unix()),
		ReqId:     cmd.reqID,
		Items:     make([]*pd.DeviceItem, 0),
	}
	m.Items = append(m.Items, toDeviceListItem(cmd.gateway))
	for _, child := range cmd.children {
		if cmd.gateway.MacAddress != child.MacAddress {
			m.Items = append(m.Items, toDeviceListItem(child))
		}
	}
	payload, err := proto.Marshal(&m)
	if err != nil {
		return nil
	}
	return payload
}

func toDeviceListItem(e entity.Device) *pd.DeviceItem {
	item := &pd.DeviceItem{
		Type: int32(e.Type),
		Mac:  utils.StringToBytes(binary.LittleEndian, e.MacAddress),
		Name: utils.StringToBytes(binary.BigEndian, fmt.Sprintf("%x", e.Name)),
	}
	return item
}

func (cmd updateDevicesCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
