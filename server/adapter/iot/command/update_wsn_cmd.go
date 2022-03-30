package command

import (
	"context"
	"fmt"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"time"
)

type wsnSettings struct {
	CommunicationPeriod uint `json:"communication_period"`
	CommunicationOffset uint `json:"communication_offset"`
}

type updateWsnCmd struct {
	request
	settings        wsnSettings
	routingTable    entity.RoutingTables
	isUpdateWsnOnly bool
}

func newUpdateWsnSettingsCmd(network entity.Network, isUpdateWsnOnly bool) updateWsnCmd {
	cmd := updateWsnCmd{
		isUpdateWsnOnly: isUpdateWsnOnly,
		settings: wsnSettings{
			CommunicationOffset: network.CommunicationTimeOffset,
			CommunicationPeriod: network.CommunicationPeriod,
		},
	}
	cmd.request = newRequest()
	return cmd
}

func (cmd updateWsnCmd) ID() string {
	return cmd.reqID
}

func (cmd updateWsnCmd) Name() string {
	return "updateWsn"
}

func (cmd updateWsnCmd) Response() string {
	return "updateWsnResponse"
}

func (cmd updateWsnCmd) Qos() byte {
	return 1
}

func (cmd updateWsnCmd) Payload() []byte {
	timestamp := time.Now().Unix()
	settings, err := json.Marshal(cmd.settings)
	if err != nil {
		return nil
	}
	m := pd.UpdateWsnCommand{
		ReqId:          cmd.reqID,
		Timestamp:      int32(timestamp),
		LastUpdateTime: int32(timestamp),
		Settings:       fmt.Sprintf(`{"wsn": %s}`, string(settings)),
	}
	if cmd.isUpdateWsnOnly {
		m.SubCommand = 1
	} else {
		m.SubCommand = 0
	}
	payload, err := proto.Marshal(&m)
	if err != nil {
		return nil
	}
	return payload
}

func (cmd updateWsnCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
