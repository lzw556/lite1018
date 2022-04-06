package command

import (
	"context"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"strconv"
	"time"
)

type upgradeFirmwareCmd struct {
	request
	firmware entity.Firmware
}

func newUpgradeFirmwareCmd(firmware entity.Firmware) upgradeFirmwareCmd {
	return upgradeFirmwareCmd{
		request:  newRequest(),
		firmware: firmware,
	}
}

func (cmd upgradeFirmwareCmd) Name() string {
	return "upgradeFirmware"
}

func (cmd upgradeFirmwareCmd) Response() string {
	return "upgradeFirmwareResponse"
}

func (cmd upgradeFirmwareCmd) Qos() byte {
	return 1
}

func (cmd upgradeFirmwareCmd) Payload() ([]byte, error) {
	m := pd.UpgradeFirmwareCommand{
		Timestamp: int32(cmd.request.timestamp),
		ReqId:     cmd.request.id,
		Crc:       cmd.firmware.Crc,
		Major:     int32(cmd.firmware.Major),
		Minor:     int32(cmd.firmware.Minor),
		Version:   int32(cmd.firmware.Version),
		Size_:     int32(cmd.firmware.Size),
		TaskId:    strconv.Itoa(int(cmd.firmware.ID)),
	}
	return proto.Marshal(&m)
}

func (cmd upgradeFirmwareCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
