package command

import (
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type SensorDataAckCommand struct {
	request
	sensorID int32
}

func NewSensorDataAckCommand(sensorID int32) SensorDataAckCommand {
	return SensorDataAckCommand{
		request:  newRequest(),
		sensorID: sensorID,
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
	}
	return proto.Marshal(&m)
}

func (cmd SensorDataAckCommand) Execute(gateway string, target string) (*Response, error) {
	return cmd.request.do(gateway, target, cmd, 3*time.Second)
}
