package command

import (
	"context"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type calibrateCmd struct {
	request
	param float32
}

func newCalibrateCmd(param float32) calibrateCmd {
	cmd := calibrateCmd{
		param: param,
	}
	cmd.request = newRequest()
	return cmd
}

func (cmd calibrateCmd) Name() string {
	return "calibrate"
}

func (cmd calibrateCmd) Response() string {
	return "calibrateResponse"
}

func (cmd calibrateCmd) Qos() byte {
	return 1
}

func (cmd calibrateCmd) Payload() ([]byte, error) {
	m := pd.CalibrateCommand{
		Timestamp: int32(cmd.request.timestamp),
		ReqId:     cmd.id,
		Type:      1073872896,
		Param1:    cmd.param,
	}
	return proto.Marshal(&m)
}

func (cmd calibrateCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
