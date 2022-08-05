package command

import (
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type clearDevicesCmd struct {
	request
}

func newClearDevicesCmd() clearDevicesCmd {
	return clearDevicesCmd{
		request: newRequest(),
	}
}

func (cmd clearDevicesCmd) ID() string {
	return cmd.request.id
}

func (cmd clearDevicesCmd) Name() string {
	return "clearDevices"
}

func (cmd clearDevicesCmd) Response() chan Response {
	return cmd.response
}

func (cmd clearDevicesCmd) Qos() byte {
	return 1
}

func (cmd clearDevicesCmd) Payload() ([]byte, error) {
	m := pd.ClearDevicesCommand{
		Timestamp: int32(time.Now().UTC().Unix()),
		ReqId:     cmd.request.id,
	}
	return proto.Marshal(&m)
}

func (cmd clearDevicesCmd) Execute(gateway string, target string, retained bool) (*Response, error) {
	return cmd.request.do(gateway, target, cmd, retained, 5)
}
