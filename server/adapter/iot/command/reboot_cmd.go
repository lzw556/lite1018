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
	cmd := rebootCmd{}
	cmd.request = newRequest()
	return cmd
}

func (cmd rebootCmd) Name() string {
	return "reboot"
}

func (cmd rebootCmd) Response() string {
	return "rebootResponse"
}

func (cmd rebootCmd) Qos() byte {
	return 1
}

func (cmd rebootCmd) Payload() []byte {
	c := pd.RebootCommand{
		ReqId:     cmd.reqID,
		Timestamp: int32(time.Now().UTC().Unix()),
	}
	bytes, err := proto.Marshal(&c)
	if err != nil {
		return nil
	}
	return bytes
}

func (cmd rebootCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
