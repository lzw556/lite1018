package command

import (
	"context"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type provisionCmd struct {
	request
}

func newProvisionCmd() provisionCmd {
	return provisionCmd{}
}

func (cmd provisionCmd) Name() string {
	return "provision"
}

func (cmd provisionCmd) Qos() byte {
	return 1
}

func (cmd provisionCmd) Payload() []byte {
	m := pd.ProvisionCommand{
		Timestamp:  int32(time.Now().Unix()),
		ReqId:      cmd.reqID,
		SubCommand: 2,
	}
	payload, err := proto.Marshal(&m)
	if err != nil {
		return nil
	}
	return payload
}

func (cmd provisionCmd) Response() string {
	return "provisionResponse"
}

func (cmd provisionCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
