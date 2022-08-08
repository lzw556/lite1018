package command

import (
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
)

type calibrateCmd struct {
	request
	param      float32
	sensorType int32
}

func newCalibrateCmd(sensorType uint, param float32) calibrateCmd {
	cmd := calibrateCmd{
		param:      param,
		sensorType: int32(sensorType),
	}
	cmd.request = newRequest()
	return cmd
}

func (cmd calibrateCmd) ID() string {
	return cmd.request.id
}

func (cmd calibrateCmd) Name() string {
	return "calibrate"
}

func (cmd calibrateCmd) Response() chan Response {
	return cmd.response
}

func (cmd calibrateCmd) Qos() byte {
	return 1
}

func (cmd calibrateCmd) Payload() ([]byte, error) {
	m := pd.CalibrateCommand{
		Timestamp: int32(cmd.request.timestamp),
		ReqId:     cmd.request.id,
		Type:      cmd.sensorType,
		Param1:    cmd.param,
	}
	xlog.Debugf("calibrate sensor type: %d, param: %f", cmd.sensorType, cmd.param)
	return proto.Marshal(&m)
}

func (cmd calibrateCmd) Execute(gateway string, target string, retained bool) (*Response, error) {
	return cmd.request.do(gateway, target, cmd, retained, 3)
}

func (cmd calibrateCmd) AsyncExecute(gateway string, target string, retained bool) error {
	return cmd.request.doAsync(gateway, target, cmd, retained, 3)
}
