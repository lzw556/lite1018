package command

import (
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type getLinkStatesCmd struct {
	request
}

func newGetLinkStatesCmd() getLinkStatesCmd {
	return getLinkStatesCmd{
		request: newRequest(),
	}
}

func (cmd getLinkStatesCmd) ID() string {
	return cmd.request.id
}

func (cmd getLinkStatesCmd) Name() string {
	return "getLinkStates"
}

func (cmd getLinkStatesCmd) Response() chan Response {
	return cmd.response
}

func (cmd getLinkStatesCmd) Qos() byte {
	return 1
}

func (cmd getLinkStatesCmd) Payload() ([]byte, error) {
	m := pd.GetLinkStatesCommand{
		Timestamp: int32(time.Now().Unix()),
		ReqId:     cmd.request.id,
	}
	return proto.Marshal(&m)
}

func (cmd getLinkStatesCmd) Execute(gateway string, target string, retained bool) (*Response, error) {
	return cmd.request.do(gateway, target, cmd, retained, 10)
}

func (cmd getLinkStatesCmd) AsyncExecute(gateway string, target string, retained bool) error {
	return cmd.request.doAsync(gateway, target, cmd, retained, 3)
}
