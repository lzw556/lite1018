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

type updateDeviceCmd struct {
	request
	device entity.Device
}

func newUpdateDeviceCmd(device entity.Device) updateDeviceCmd {
	return updateDeviceCmd{
		request: newRequest(),
		device:  device,
	}
}

func (cmd updateDeviceCmd) ID() string {
	return cmd.request.id
}

func (cmd updateDeviceCmd) Name() string {
	return "updateDevice"
}

func (cmd updateDeviceCmd) Response() chan Response {
	return cmd.response
}

func (cmd updateDeviceCmd) Qos() byte {
	return 1
}

func (cmd updateDeviceCmd) Payload() ([]byte, error) {
	m := pd.UpdateDeviceCommand{
		Timestamp: int32(cmd.request.timestamp),
		ReqId:     cmd.request.id,
		Mac:       utils.StringToBytes(binary.BigEndian, cmd.device.MacAddress),
		ParentMac: utils.StringToBytes(binary.BigEndian, cmd.device.Parent),
		Name:      utils.StringToBytes(binary.BigEndian, fmt.Sprintf("%x", cmd.device.Name)),
		Type:      int32(cmd.device.Type),
	}
	return proto.Marshal(&m)
}

func (cmd updateDeviceCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) (*Response, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
