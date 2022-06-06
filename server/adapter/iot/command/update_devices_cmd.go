package command

import (
	"encoding/binary"
	"fmt"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/utils"
	"sort"
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
	sort.Sort(cmd.children)
	for _, child := range cmd.children {
		if cmd.gateway.MacAddress != child.MacAddress {
			m.Items = append(m.Items, toDeviceItem(child))
		}
	}
	return proto.Marshal(&m)
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
