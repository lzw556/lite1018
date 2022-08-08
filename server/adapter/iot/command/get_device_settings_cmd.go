package command

import (
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
)

type getDeviceSettingsCmd struct {
	request
}

func newGetDeviceSettingsCmd() getDeviceSettingsCmd {
	return getDeviceSettingsCmd{
		request: newRequest(),
	}
}

func (cmd getDeviceSettingsCmd) ID() string {
	return cmd.request.id
}

func (cmd getDeviceSettingsCmd) Name() string {
	return "getDeviceSettings"
}

func (cmd getDeviceSettingsCmd) Response() chan Response {
	return cmd.response
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

func (cmd getDeviceSettingsCmd) Execute(gateway string, target string, retained bool) (*Response, error) {
	return cmd.request.do(gateway, target, cmd, retained, 3)
}

func (cmd getDeviceSettingsCmd) AsyncExecute(gateway string, target string, retained bool) error {
	return cmd.request.doAsync(gateway, target, cmd, retained, 3)
}
