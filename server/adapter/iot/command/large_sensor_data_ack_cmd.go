package command

import (
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type LargeSensorDataAckCommand struct {
	request
	sessionID int32
	segmentID int32
}

func NewLargeSensorDataAckCommand(sessionID int32, segmentID int32) LargeSensorDataAckCommand {
	return LargeSensorDataAckCommand{
		request:   newRequest(),
		sessionID: sessionID,
		segmentID: segmentID,
	}
}

func (cmd LargeSensorDataAckCommand) ID() string {
	return cmd.request.id
}

func (cmd LargeSensorDataAckCommand) Name() string {
	return "largeSensorDataAck"
}

func (cmd LargeSensorDataAckCommand) Response() chan Response {
	return nil
}

func (cmd LargeSensorDataAckCommand) Qos() byte {
	return 1
}

func (cmd LargeSensorDataAckCommand) Payload() ([]byte, error) {
	m := pd.LargeSensorDataAckCommand{
		ReqId:     cmd.request.id,
		Timestamp: int32(cmd.request.timestamp),
		SessionId: cmd.sessionID,
		SegmentId: cmd.segmentID,
	}
	return proto.Marshal(&m)
}

func (cmd LargeSensorDataAckCommand) Execute(gateway string, target string, retained bool) (*Response, error) {
	return cmd.request.do(gateway, target, cmd, retained, 3*time.Second)
}

func (cmd LargeSensorDataAckCommand) ExecuteAsync(gateway string, target string, retained bool) error {
	return cmd.request.doAsync(gateway, target, cmd, retained, 3)
}
