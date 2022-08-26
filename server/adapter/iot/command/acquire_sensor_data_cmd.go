package command

import pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"

type acquireSensorDataCmd struct {
	request
}

func newAcquireSensorDataCmd() acquireSensorDataCmd {
	return acquireSensorDataCmd{
		request: newRequest(),
	}
}

func (cmd acquireSensorDataCmd) ID() string {
	return cmd.request.id
}

func (cmd acquireSensorDataCmd) Name() string {
	return "acquireSensorData"
}

func (cmd acquireSensorDataCmd) Response() chan Response {
	return nil
}

func (cmd acquireSensorDataCmd) Qos() byte {
	return 1
}

func (cmd acquireSensorDataCmd) Payload() ([]byte, error) {
	m := pd.AcquireSensorDataCommand{
		ReqId:      cmd.request.id,
		Timestamp:  int32(cmd.request.timestamp),
		SubCommand: 2,
	}
	return m.Marshal()
}

func (cmd acquireSensorDataCmd) Execute(gateway string, target string, retained bool) (*Response, error) {
	return cmd.request.do(gateway, target, cmd, retained, 3)
}

func (cmd acquireSensorDataCmd) ExecuteAsync(gateway string, target string, retained bool) error {
	return cmd.request.doAsync(gateway, target, cmd, retained, 3)
}
