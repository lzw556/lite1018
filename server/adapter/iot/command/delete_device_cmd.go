package command

import (
	"context"
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

func (cmd deleteDeviceCmd) Name() string {
	return "deleteDevice"
}

func (cmd deleteDeviceCmd) Response() string {
	return "deleteDeviceResponse"
}

func (cmd deleteDeviceCmd) Qos() byte {
	return 1
}

func (cmd deleteDeviceCmd) Payload() []byte {
	m := pd.DeleteDeviceCommand{
		Timestamp: int32(time.Now().Unix()),
		ReqId:     cmd.request.id,
		Mac:       utils.StringToBytes(binary.BigEndian, cmd.mac),
	}
	payload, err := proto.Marshal(&m)
	if err != nil {
		return nil
	}
	return payload
}

func (cmd deleteDeviceCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.do(ctx, gateway, target, cmd, timeout)
}
