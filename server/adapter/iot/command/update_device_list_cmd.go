package command

import (
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
	m.Items = append(m.Items, &pd.DeviceListItem{
		Mac:  []byte(cmd.gateway.MacAddress),
		Name: []byte(cmd.gateway.Name),
		Type: int32(cmd.gateway.TypeID),
	})
	for _, child := range cmd.children {
		if cmd.gateway.MacAddress != child.MacAddress {
			m.Items = append(m.Items, &pd.DeviceListItem{
				Mac:  []byte(child.MacAddress),
				Name: []byte(child.Name),
				Type: int32(child.TypeID),
			})
		}
	}
	bytes, err := proto.Marshal(&m)
	if err != nil {
		return nil
	}
	return bytes
}

func (cmd UpdateDeviceListCmd) Response() chan pd.GeneralResponseMessage {
	return cmd.response
}
