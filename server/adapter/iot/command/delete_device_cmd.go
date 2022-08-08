package command

import (
	"encoding/binary"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/utils"
	"time"
)

type deleteDeviceCmd struct {
	request
	mac string
}

func newDeleteDeviceCmd(mac string) deleteDeviceCmd {
	return deleteDeviceCmd{
		request: newRequest(),
		mac:     mac,
	}
}

func (cmd deleteDeviceCmd) ID() string {
	return cmd.request.id
}

func (cmd deleteDeviceCmd) Name() string {
	return "deleteDevice"
}

func (cmd deleteDeviceCmd) Response() chan Response {
	return cmd.response
}

func (cmd deleteDeviceCmd) Qos() byte {
	return 1
}

func (cmd deleteDeviceCmd) Payload() ([]byte, error) {
	m := pd.DeleteDeviceCommand{
		Timestamp: int32(time.Now().Unix()),
		ReqId:     cmd.request.id,
		Mac:       utils.StringToBytes(binary.BigEndian, cmd.mac),
	}
	return proto.Marshal(&m)
}

func (cmd deleteDeviceCmd) Execute(gateway string, target string, retained bool) (*Response, error) {
	return cmd.do(gateway, target, cmd, retained, 3)
}
