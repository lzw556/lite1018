package command

import (
	"context"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type getLinkStatesCmd struct {
	request
}

func newGetLinkStatesCmd() getLinkStatesCmd {
	return getLinkStatesCmd{}
}

func (cmd getLinkStatesCmd) Name() string {
	return "getLinkStates"
}

func (cmd getLinkStatesCmd) Response() string {
	return "getLinkStatesResponse"
}

func (cmd getLinkStatesCmd) Qos() byte {
	return 1
}

func (cmd getLinkStatesCmd) Payload() []byte {
	m := pd.GetLinkStatesCommand{
		Timestamp: int32(time.Now().Unix()),
		ReqId:     cmd.id,
	}
	payload, err := proto.Marshal(&m)
	if err != nil {
		return nil
	}
	return payload
}

func (cmd getLinkStatesCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
