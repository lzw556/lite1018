package command

import (
	"encoding/hex"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"time"
)

type UpdateDeviceListCmd struct {
	command
	gateway  entity.Device
	children []entity.Device
}

func NewUpdateDeviceListCmd(gateway entity.Device, children []entity.Device) UpdateDeviceListCmd {
	cmd := UpdateDeviceListCmd{
		gateway:  gateway,
		children: children,
	}
	cmd.command = newCommand()
	return cmd
}

func (cmd UpdateDeviceListCmd) ID() string {
	return cmd.reqID
}

func (UpdateDeviceListCmd) Name() string {
	return "updateDeviceList"
}

func (UpdateDeviceListCmd) Qos() byte {
	return 1
}

func (cmd UpdateDeviceListCmd) Payload() []byte {
	m := pd.UpdateDeviceListCommand{
		Timestamp: int32(time.Now().Unix()),
		ReqId:     cmd.reqID,
		Items:     make([]*pd.DeviceListItem, 0),
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

func toDeviceListItem(e entity.Device) *pd.DeviceListItem {
	item := &pd.DeviceListItem{
		Type: int32(e.TypeID),
	}
	item.Mac, _ = hex.DecodeString(e.MacAddress)
	item.Name, _ = hex.DecodeString(e.Name)
	return item
}

func (cmd UpdateDeviceListCmd) Response() chan pd.GeneralResponseMessage {
	return cmd.response
}
