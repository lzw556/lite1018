package command

import (
	"context"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type cancelFirmwareCmd struct {
	request
}

func newCancelFirmwareCmd() cancelFirmwareCmd {
	return cancelFirmwareCmd{
		request: newRequest(),
	}
}

func (cmd cancelFirmwareCmd) Name() string {
	return "cancelFirmware"
}

func (cmd cancelFirmwareCmd) Response() string {
	return "cancelFirmwareResponse"
}

func (cmd cancelFirmwareCmd) Qos() byte {
	return 1
}

func (cmd cancelFirmwareCmd) Payload() []byte {
	m := pd.CancelFirmwareCommand{
		Timestamp: int32(time.Now().Unix()),
		ReqId:     cmd.reqID,
	}
	payload, err := proto.Marshal(&m)
	if err != nil {
		return nil
	}
	return payload
}

func (cmd cancelFirmwareCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
