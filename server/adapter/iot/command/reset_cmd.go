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
	cmd := resetCmd{}
	cmd.request = newRequest()
	return cmd
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

func (cmd resetCmd) Payload() []byte {
	c := pd.ResetCommand{
		ReqId:     cmd.id,
		Timestamp: int32(time.Now().UTC().Unix()),
	}
	bytes, err := proto.Marshal(&c)
	if err != nil {
		return nil
	}
	return bytes
}

func (cmd resetCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
