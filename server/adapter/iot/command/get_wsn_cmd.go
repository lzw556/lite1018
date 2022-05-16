package command

import (
	"context"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type getWsnCmd struct {
	request
}

func newGetWsnCmd() getWsnCmd {
	return getWsnCmd{
		request: newRequest(),
	}
}

func (cmd getWsnCmd) Name() string {
	return "getWsn"
}

func (cmd getWsnCmd) Response() string {
	return "getWsnResponse"
}

func (cmd getWsnCmd) Qos() byte {
	return 1
}

func (cmd getWsnCmd) Payload() ([]byte, error) {
	m := pd.GetWsnCommand{
		Timestamp: int32(cmd.request.timestamp),
		ReqId:     cmd.request.id,
	}
	return proto.Marshal(&m)
}

func (cmd getWsnCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
