package command

import (
	"context"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type resetCmd struct {
	request
}

func newResetCmd() resetCmd {
	return resetCmd{
		request: newRequest(),
	}
}

func (cmd resetCmd) Name() string {
	return "resetDeviceSettings"
}

func (cmd resetCmd) Response() string {
	return "resetDeviceSettingsResponse"
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

func (cmd resetCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
