package command

import (
	"context"
	"encoding/binary"
	"fmt"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/utils"
	"time"
)

type addDeviceCmd struct {
	request request
	reqID   string
	mac     string
	parent  string
	name    string
	typeID  uint
}

func newAddDeviceCmd(name, mac, parent string, typeID uint) addDeviceCmd {
	return addDeviceCmd{
		request: newRequest(),
		name:    name,
		mac:     mac,
		parent:  parent,
		typeID:  typeID,
	}
}

func (cmd addDeviceCmd) Name() string {
	return "addDevice"
}

func (cmd addDeviceCmd) Response() string {
	return "addDeviceResponse"
}

func (cmd addDeviceCmd) Qos() byte {
	return 1
}

func (cmd addDeviceCmd) Payload() []byte {
	m := pd.AddDeviceCommand{
		Timestamp: int32(time.Now().Unix()),
		ReqId:     cmd.reqID,
		Type:      int32(cmd.typeID),
		Name:      utils.StringToBytes(binary.BigEndian, fmt.Sprintf("%x", cmd.name)),
		Mac:       utils.StringToBytes(binary.BigEndian, cmd.mac),
		ParentMac: utils.StringToBytes(binary.BigEndian, cmd.parent),
	}
	payload, err := proto.Marshal(&m)
	if err != nil {
		return nil
	}
	return payload
}

func (cmd addDeviceCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
