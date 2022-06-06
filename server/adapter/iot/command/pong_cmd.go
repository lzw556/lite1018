package command

import (
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type PongCommand struct {
	request
}

func NewPongCommand() PongCommand {
	return PongCommand{
		request: newRequest(),
	}
}

func (cmd PongCommand) ID() string {
	return cmd.request.id
}

func (cmd PongCommand) Name() string {
	return "pong"
}

func (cmd PongCommand) Response() chan Response {
	return nil
}

func (cmd PongCommand) Qos() byte {
	return 1
}

func (cmd PongCommand) Payload() ([]byte, error) {
	m := pd.PongCommand{
		ReqId:     cmd.request.id,
		Timestamp: int32(cmd.request.timestamp),
	}
	return m.Marshal()
}

func (cmd PongCommand) Execute(gateway string, target string) (*Response, error) {
	return cmd.request.do(gateway, target, cmd, 3*time.Second)
}
