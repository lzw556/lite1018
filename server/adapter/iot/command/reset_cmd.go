package command

import (
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
)

type resetCmd struct {
	request
}

func newResetCmd() resetCmd {
	return resetCmd{
		request: newRequest(),
	}
}

func (cmd resetCmd) ID() string {
	return cmd.request.id
}

func (cmd resetCmd) Name() string {
	return "resetDeviceSettings"
}

func (cmd resetCmd) Response() chan Response {
	return cmd.response
}

func (cmd resetCmd) Qos() byte {
	return 1
}

func (cmd resetCmd) Payload() ([]byte, error) {
	m := pd.ResetCommand{
		ReqId:     cmd.request.id,
		Timestamp: int32(cmd.request.timestamp),
	}
	return proto.Marshal(&m)
}

func (cmd resetCmd) Execute(gateway string, target string, retained bool) (*Response, error) {
	return cmd.request.do(gateway, target, cmd, retained, 3)
}

func (cmd resetCmd) AsyncExecute(gateway string, target string, retained bool) error {
	return cmd.request.doAsync(gateway, target, cmd, retained, 3)
}
