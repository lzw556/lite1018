package command

import (
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type PullFirmwareResponseCmd struct {
	request
	seqID int32
	data  []byte
	size  int32
}

func NewPullFirmwareResponseCmd(seqID, size int32, data []byte) PullFirmwareResponseCmd {
	return PullFirmwareResponseCmd{
		request: newRequest(),
		seqID:   seqID,
		size:    size,
		data:    data,
	}
}

func (cmd PullFirmwareResponseCmd) ID() string {
	return cmd.request.id
}

func (cmd PullFirmwareResponseCmd) Name() string {
	return "pullFirmwareResponse"
}

func (cmd PullFirmwareResponseCmd) Response() chan Response {
	return nil
}

func (cmd PullFirmwareResponseCmd) Qos() byte {
	return 1
}

func (cmd PullFirmwareResponseCmd) Payload() ([]byte, error) {
	m := &pd.PullFirmwareResponseCommand{
		ReqId:      cmd.request.id,
		Timestamp:  int32(cmd.timestamp),
		SeqId:      cmd.seqID,
		Data:       cmd.data,
		DataLength: int32(len(cmd.data)),
		Size_:      cmd.size,
	}
	return m.Marshal()
}

func (cmd PullFirmwareResponseCmd) Execute(gateway string, target string, retained bool) (*Response, error) {
	return cmd.request.do(gateway, target, cmd, retained, 5*time.Second)
}

func (cmd PullFirmwareResponseCmd) ExecuteAsync(gateway string, target string, retained bool) error {
	return cmd.request.doAsync(gateway, target, cmd, retained, 5*time.Second)
}
