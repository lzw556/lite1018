package command

import (
	"encoding/binary"
	"fmt"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/utils"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type updateDevicesCmd struct {
	request
	gateway  entity.Device
	children entity.Devices
}

func newUpdateDevicesCmd(gateway entity.Device, children []entity.Device) updateDevicesCmd {
	return updateDevicesCmd{
		request:  newRequest(),
		gateway:  gateway,
		children: children,
	}
}

func (cmd updateDevicesCmd) ID() string {
	return cmd.request.id
}

func (updateDevicesCmd) Name() string {
	return "updateDevices"
}

func (cmd updateDevicesCmd) Response() chan Response {
	return cmd.response
}

func (updateDevicesCmd) Qos() byte {
	return 1
}

func (cmd updateDevicesCmd) Payload() ([]byte, error) {
	m := pd.UpdateDevicesCommand{
		Timestamp: int32(cmd.request.timestamp),
		ReqId:     cmd.request.id,
		Items:     make([]*pd.DeviceItem, 0),
	}
	m.Items = append(m.Items, toDeviceItem(cmd.gateway))
	m.Items = addChildren(m.Items, cmd.gateway, cmd.children)
	xlog.Infof("update %d devices to gateway => [%s]", len(m.Items), cmd.gateway.MacAddress)
	return proto.Marshal(&m)
}

func addChildren(items []*pd.DeviceItem, parent entity.Device, children []entity.Device) []*pd.DeviceItem {
	for _, child := range children {
		if child.Parent == parent.MacAddress {
			items = append(items, toDeviceItem(child))
			addChildren(items, child, children)
		}
	}
	return items
}

func toDeviceItem(e entity.Device) *pd.DeviceItem {
	item := &pd.DeviceItem{
		Type:      int32(e.Type),
		Mac:       utils.StringToBytes(binary.BigEndian, e.MacAddress),
		ParentMac: utils.StringToBytes(binary.BigEndian, e.Parent),
		Name:      utils.StringToBytes(binary.BigEndian, fmt.Sprintf("%x", e.Name)),
	}
	return item
}

func (cmd updateDevicesCmd) Execute(gateway string, target string) (*Response, error) {
	return cmd.request.do(gateway, target, cmd, 5)
}
