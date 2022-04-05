package command

import (
	"context"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type resetDataCmd struct {
	request
}

func newResetDataCmd() resetDataCmd {
	return resetDataCmd{
		request: newRequest(),
	}
}

func (cmd resetDataCmd) Name() string {
	return "resetData"
}

func (cmd resetDataCmd) Qos() byte {
	return 1
}

func (cmd resetDataCmd) Payload() []byte {
	m := pd.ResetDataCommand{
		Timestamp: int32(time.Now().Unix()),
		ReqId:     cmd.id,
	}
	payload, err := proto.Marshal(&m)
	if err != nil {
		return nil
	}
	return payload
}

func (cmd resetDataCmd) Response() string {
	return "resetDataResponse"
}

func (cmd resetDataCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
