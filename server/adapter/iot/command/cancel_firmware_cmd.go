package command

import (
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
)

type cancelFirmwareCmd struct {
	request
}

func newCancelFirmwareCmd() cancelFirmwareCmd {
	return cancelFirmwareCmd{
		request: newRequest(),
	}
}

func (cmd cancelFirmwareCmd) ID() string {
	return cmd.request.id
}

func (cmd cancelFirmwareCmd) Name() string {
	return "cancelFirmware"
}

func (cmd cancelFirmwareCmd) Response() chan Response {
	return cmd.response
}

func (cmd cancelFirmwareCmd) Qos() byte {
	return 1
}

func (cmd cancelFirmwareCmd) Payload() ([]byte, error) {
	m := pd.CancelFirmwareCommand{
		Timestamp: int32(cmd.request.timestamp),
		ReqId:     cmd.request.id,
	}
	return proto.Marshal(&m)
}

func (cmd cancelFirmwareCmd) Execute(gateway string, target string) (*Response, error) {
	return cmd.request.do(gateway, target, cmd)
}
