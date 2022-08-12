package command

import (
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type provisionCmd struct {
	request
}

func newProvisionCmd() provisionCmd {
	return provisionCmd{
		request: newRequest(),
	}
}

func (cmd provisionCmd) ID() string {
	return cmd.request.id
}

func (cmd provisionCmd) Name() string {
	return "provision"
}

func (cmd provisionCmd) Response() chan Response {
	return cmd.response
}

func (cmd provisionCmd) Qos() byte {
	return 1
}

func (cmd provisionCmd) Payload() ([]byte, error) {
	m := pd.ProvisionCommand{
		Timestamp:  int32(time.Now().Unix()),
		ReqId:      cmd.id,
		SubCommand: 2,
	}
	return proto.Marshal(&m)
}

func (cmd provisionCmd) Execute(gateway string, target string, retained bool) (*Response, error) {
	return cmd.request.do(gateway, target, cmd, retained, 3)
}

func (cmd provisionCmd) ExecuteAsync(gateway string, target string, retained bool) error {
	return cmd.request.doAsync(gateway, target, cmd, retained, 3)
}
