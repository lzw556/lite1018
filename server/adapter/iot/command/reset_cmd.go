package command

import (
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"time"
)

type ResetCmd struct {
	command
}

func NewResetCmd() ResetCmd {
	cmd := ResetCmd{}
	cmd.command = newCommand()
	return cmd
}

func (cmd ResetCmd) ID() string {
	return cmd.reqID
}

func (cmd ResetCmd) Name() string {
	return "resetDeviceSettings"
}

func (cmd ResetCmd) Qos() byte {
	return 1
}

func (cmd ResetCmd) Payload() []byte {
	c := pd.ResetCommand{
		ReqId:     cmd.reqID,
		Timestamp: int32(time.Now().UTC().Unix()),
	}
	bytes, err := proto.Marshal(&c)
	if err != nil {
		return nil
	}
	return bytes
}

func (cmd ResetCmd) Response() chan pd.GeneralResponseMessage {
	return cmd.response
}
