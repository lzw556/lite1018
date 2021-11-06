package command

import (
	"context"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type getAllLinkStatusCmd struct {
	request
}

func newGetAllLinkStatusCmd() getAllLinkStatusCmd {
	return getAllLinkStatusCmd{}
}

func (cmd getAllLinkStatusCmd) Name() string {
	return "getAllLinkStatus"
}

func (cmd getAllLinkStatusCmd) Qos() byte {
	return 1
}

func (cmd getAllLinkStatusCmd) Payload() []byte {
	m := pd.GetAllLinkStatusCommand{
		Timestamp: int32(time.Now().Unix()),
		ReqId:     cmd.reqID,
	}
	payload, err := proto.Marshal(&m)
	if err != nil {
		return nil
	}
	return payload
}

func (cmd getAllLinkStatusCmd) Response() string {
	return "getAllLinkStatusResponse"
}

func (cmd getAllLinkStatusCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
