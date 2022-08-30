package command

import (
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type SensorDataAckCommand struct {
	request
	sensorID  int32
	sessionID int32
}

func NewSensorDataAckCmd(sessionID, sensorID int32) SensorDataAckCommand {
	return SensorDataAckCommand{
		request:   newRequest(),
		sessionID: sessionID,
		sensorID:  sensorID,
	}
}

func (cmd SensorDataAckCommand) ID() string {
	return cmd.request.id
}

func (cmd SensorDataAckCommand) Name() string {
	return "sensorDataAck"
}

func (cmd SensorDataAckCommand) Response() chan Response {
	return nil
}

func (cmd SensorDataAckCommand) Qos() byte {
	return 1
}

func (cmd SensorDataAckCommand) Payload() ([]byte, error) {
	m := pd.SensorDataAckCommand{
		ReqId:     cmd.request.id,
		Timestamp: int32(cmd.request.timestamp),
		SensorId:  cmd.sensorID,
		SessionId: cmd.sessionID,
	}
	return proto.Marshal(&m)
}

func (cmd SensorDataAckCommand) Execute(gateway string, target string, retained bool) (*Response, error) {
	return cmd.request.do(gateway, target, cmd, retained, 3*time.Second)
}

func (cmd SensorDataAckCommand) ExecuteAsync(gateway string, target string, retained bool) error {
	return cmd.request.doAsync(gateway, target, cmd, retained, 3)
}
