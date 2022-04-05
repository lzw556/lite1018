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

type addDeviceCmd struct {
	request
	device entity.Device
}

func newAddDeviceCmd(device entity.Device) addDeviceCmd {
	return addDeviceCmd{
		request: newRequest(),
		device:  device,
	}
}

func (cmd addDeviceCmd) Name() string {
	return "addDevice"
}

func (cmd addDeviceCmd) Response() string {
	return "addDeviceResponse"
}

func (cmd addDeviceCmd) Qos() byte {
	return 1
}

func (cmd addDeviceCmd) Payload() []byte {
	m := pd.AddDeviceCommand{
		Timestamp: int32(time.Now().Unix()),
		ReqId:     cmd.id,
		Type:      int32(cmd.device.Type),
		Name:      utils.StringToBytes(binary.BigEndian, fmt.Sprintf("%x", cmd.device.Name)),
		Mac:       utils.StringToBytes(binary.BigEndian, cmd.device.MacAddress),
		ParentMac: utils.StringToBytes(binary.BigEndian, cmd.device.Parent),
	}
	payload, err := proto.Marshal(&m)
	if err != nil {
		return nil
	}
	return payload
}

func (cmd addDeviceCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
