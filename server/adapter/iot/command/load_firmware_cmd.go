package command

import (
	"context"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"strconv"
	"time"
)

type loadFirmwareCmd struct {
	request
	firmwareID uint
	seqID      int
	data       []byte
	total      int
}

func newLoadFirmwareCmd(id uint, seqID int, data []byte, total int) loadFirmwareCmd {
	return loadFirmwareCmd{
		request:    newRequest(),
		firmwareID: id,
		seqID:      seqID,
		data:       data,
		total:      total,
	}
}

func (cmd loadFirmwareCmd) Name() string {
	return "loadFirmware"
}

func (cmd loadFirmwareCmd) Response() string {
	return "loadFirmwareResponse"
}

func (cmd loadFirmwareCmd) Qos() byte {
	return 1
}

func (cmd loadFirmwareCmd) Payload() []byte {
	m := pd.LoadFirmwareCommand{
		Timestamp:  int32(time.Now().Unix()),
		ReqId:      cmd.reqID,
		TaskId:     strconv.Itoa(int(cmd.firmwareID)),
		SeqId:      int32(cmd.seqID),
		Data:       cmd.data,
		DataLength: int32(len(cmd.data)),
		Size_:      int32(cmd.total),
	}
	payload, err := proto.Marshal(&m)
	if err != nil {
		return nil
	}
	return payload
}

func (cmd loadFirmwareCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
