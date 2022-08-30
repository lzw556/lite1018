package command

import (
	"encoding/binary"
	"fmt"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/utils"
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

func (cmd addDeviceCmd) ID() string {
	return cmd.request.id
}

func (cmd addDeviceCmd) Name() string {
	return "addDevice"
}

func (cmd addDeviceCmd) Response() chan Response {
	return cmd.response
}

func (cmd addDeviceCmd) Qos() byte {
	return 1
}

func (cmd addDeviceCmd) Payload() ([]byte, error) {
	m := pd.AddDeviceCommand{
		Timestamp: int32(cmd.request.timestamp),
		ReqId:     cmd.id,
		Type:      int32(cmd.device.Type),
		Name:      utils.StringToBytes(binary.BigEndian, fmt.Sprintf("%x", cmd.device.Name)),
		Mac:       utils.StringToBytes(binary.BigEndian, cmd.device.MacAddress),
		ParentMac: utils.StringToBytes(binary.BigEndian, cmd.device.Parent),
	}
	return proto.Marshal(&m)
}

func (cmd addDeviceCmd) Execute(gateway string, target string, retained bool) (*Response, error) {
	return cmd.request.do(gateway, target, cmd, retained, 3)
}

func (cmd addDeviceCmd) ExecuteAsync(gateway string, target string, retained bool) error {
	return cmd.request.doAsync(gateway, target, cmd, retained, 3)
}
