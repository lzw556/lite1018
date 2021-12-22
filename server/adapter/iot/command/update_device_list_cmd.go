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

type updateDeviceListCmd struct {
	request
	gateway  entity.Device
	children []entity.Device
}

func newUpdateDeviceListCmd(gateway entity.Device, children []entity.Device) updateDeviceListCmd {
	cmd := updateDeviceListCmd{
		gateway:  gateway,
		children: children,
	}
	cmd.request = newRequest()
	return cmd
}

func (updateDeviceListCmd) Name() string {
	return "updateDeviceList"
}

func (cmd updateDeviceListCmd) Response() string {
	return "updateDeviceListResponse"
}

func (updateDeviceListCmd) Qos() byte {
	return 1
}

func (cmd updateDeviceListCmd) Payload() []byte {
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
		Type: int32(e.Type),
		Mac:  utils.StringToBytes(binary.LittleEndian, e.MacAddress),
		Name: utils.StringToBytes(binary.BigEndian, fmt.Sprintf("%x", e.Name)),
	}
	return item
}

func (cmd updateDeviceListCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
