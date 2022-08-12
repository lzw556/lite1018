package command

import (
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
)

type resetDataCmd struct {
	request
}

func newResetDataCmd() resetDataCmd {
	return resetDataCmd{
		request: newRequest(),
	}
}

func (cmd resetDataCmd) ID() string {
	return cmd.request.id
}

func (cmd resetDataCmd) Name() string {
	return "resetData"
}

func (cmd resetDataCmd) Response() chan Response {
	return cmd.response
}

func (cmd resetDataCmd) Qos() byte {
	return 1
}

func (cmd resetDataCmd) Payload() ([]byte, error) {
	m := pd.ResetDataCommand{
		Timestamp: int32(cmd.request.timestamp),
		ReqId:     cmd.request.id,
	}
	return proto.Marshal(&m)
}

func (cmd resetDataCmd) Execute(gateway string, target string, retained bool) (*Response, error) {
	return cmd.request.do(gateway, target, cmd, retained, 3)
}

func (cmd resetDataCmd) ExecuteAsync(gateway string, target string, retained bool) error {
	return cmd.request.doAsync(gateway, target, cmd, retained, 3)
}
