package command

import (
	"context"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type rebootCmd struct {
	request
}

func newRebootCmd() rebootCmd {
	return rebootCmd{
		request: newRequest(),
	}
}

func (cmd rebootCmd) ID() string {
	return cmd.request.id
}

func (cmd rebootCmd) Name() string {
	return "reboot"
}

func (cmd rebootCmd) Response() chan Response {
	return cmd.response
}

func (cmd rebootCmd) Qos() byte {
	return 1
}

func (cmd rebootCmd) Payload() ([]byte, error) {
	m := pd.RebootCommand{
		ReqId:     cmd.request.id,
		Timestamp: int32(cmd.request.timestamp),
	}
	return proto.Marshal(&m)
}

func (cmd rebootCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) (*Response, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
