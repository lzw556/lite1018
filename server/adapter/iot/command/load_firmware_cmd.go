package command

import (
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

func (cmd loadFirmwareCmd) ID() string {
	return cmd.request.id
}

func (cmd loadFirmwareCmd) Name() string {
	return "loadFirmware"
}

func (cmd loadFirmwareCmd) Response() chan Response {
	return cmd.response
}

func (cmd loadFirmwareCmd) Qos() byte {
	return 1
}

func (cmd loadFirmwareCmd) Payload() ([]byte, error) {
	m := pd.LoadFirmwareCommand{
		Timestamp:  int32(cmd.request.timestamp),
		ReqId:      cmd.request.id,
		TaskId:     strconv.Itoa(int(cmd.firmwareID)),
		SeqId:      int32(cmd.seqID),
		Data:       cmd.data,
		DataLength: int32(len(cmd.data)),
		Size_:      int32(cmd.total),
	}
	return proto.Marshal(&m)
}

func (cmd loadFirmwareCmd) Execute(gateway string, target string, retained bool) (*Response, error) {
	return cmd.request.do(gateway, target, cmd, retained, 5*time.Second)
}
