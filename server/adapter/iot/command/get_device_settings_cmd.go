package command

import (
	"context"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type getDeviceSettingsCmd struct {
	request
}

func newGetDeviceSettingsCmd() getDeviceSettingsCmd {
	return getDeviceSettingsCmd{
		request: newRequest(),
	}
}

func (cmd getDeviceSettingsCmd) Name() string {
	return "getDeviceSettings"
}

func (cmd getDeviceSettingsCmd) Response() string {
	return "getDeviceSettingsResponse"
}

func (cmd getDeviceSettingsCmd) Qos() byte {
	return 1
}

func (cmd getDeviceSettingsCmd) Payload() ([]byte, error) {
	m := pd.GetDeviceSettingsCommand{
		Timestamp: int32(cmd.request.timestamp),
		ReqId:     cmd.request.id,
	}
	return proto.Marshal(&m)
}

func (cmd getDeviceSettingsCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
