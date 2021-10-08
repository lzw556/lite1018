package command

import (
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type RebootCmd struct {
	command
}

func NewRebootCmd() RebootCmd {
	cmd := RebootCmd{}
	cmd.command = newCommand()
	return cmd
}

func (cmd RebootCmd) ID() string {
	return cmd.reqID
}

func (cmd RebootCmd) Name() string {
	return "reboot"
}

func (cmd RebootCmd) Qos() byte {
	return 1
}

func (cmd RebootCmd) Payload() []byte {
	c := pd.RebootCommand{
		ReqId:     cmd.reqID,
		Timestamp: int32(time.Now().UTC().Unix()),
	}
	bytes, err := proto.Marshal(&c)
	if err != nil {
		return nil
	}
	return bytes
}

func (cmd RebootCmd) Response() chan pd.GeneralResponseMessage {
	return cmd.response
}
