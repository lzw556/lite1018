package command

import (
	"encoding/binary"
	"fmt"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/utils"
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
		NewMac:    utils.StringToBytes(binary.BigEndian, cmd.device.MacAddress),
		ParentMac: utils.StringToBytes(binary.BigEndian, cmd.device.Parent),
		Name:      utils.StringToBytes(binary.BigEndian, fmt.Sprintf("%x", cmd.device.Name)),
		Type:      int32(cmd.device.Type),
	}
	return proto.Marshal(&m)
}

func (cmd updateDeviceCmd) Execute(gateway string, target string, retained bool) (*Response, error) {
	return cmd.request.do(gateway, target, cmd, retained, 3)
}

func (cmd updateDeviceCmd) ExecuteAsync(gateway string, target string, retained bool) error {
	return cmd.request.doAsync(gateway, target, cmd, retained, 3)
}
