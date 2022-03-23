package command

import (
	"bytes"
	"context"
	"encoding/hex"
	"fmt"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"time"
)

type wsnSettings struct {
	CommunicationPeriod uint `json:"communication_period"`
	JobPeriod           uint `json:"job_period"`
	CommunicationOffset uint `json:"communication_offset"`
}

type updateWsnSettingsCmd struct {
	request
	settings        wsnSettings
	routingTable    entity.RoutingTables
	isUpdateWsnOnly bool
}

func newUpdateWsnSettingsCmd(network entity.Network, isUpdateWsnOnly bool) updateWsnSettingsCmd {
	cmd := updateWsnSettingsCmd{
		isUpdateWsnOnly: isUpdateWsnOnly,
		settings: wsnSettings{
			CommunicationOffset: network.CommunicationTimeOffset,
			CommunicationPeriod: network.CommunicationPeriod,
			JobPeriod:           network.CommunicationPeriod,
		},
		routingTable: network.RoutingTables,
	}
	cmd.request = newRequest()
	return cmd
}

func (cmd updateWsnSettingsCmd) ID() string {
	return cmd.reqID
}

func (cmd updateWsnSettingsCmd) Name() string {
	return "updateWsnSettings"
}

func (cmd updateWsnSettingsCmd) Response() string {
	return "updateWsnSettingsResponse"
}

func (cmd updateWsnSettingsCmd) Qos() byte {
	return 1
}

func (cmd updateWsnSettingsCmd) Payload() []byte {
	timestamp := time.Now().Unix()
	settings, err := json.Marshal(cmd.settings)
	if err != nil {
		return nil
	}
	m := pd.UpdateWsnSettingsCommand{
		ReqId:          cmd.reqID,
		Timestamp:      int32(timestamp),
		LastUpdateTime: int32(timestamp),
		WsnSettings:    fmt.Sprintf(`{"wsn": %s}`, string(settings)),
	}
	if cmd.isUpdateWsnOnly {
		m.SubCommand = 1
	} else {
		m.SubCommand = 0
		for _, table := range cmd.routingTable {
			child, _ := hex.DecodeString(table[0])
			parent, _ := hex.DecodeString(table[1])
			m.RoutingTable = combineBytes(m.RoutingTable, child, parent)
		}
		m.RoutingTableLength = int32(len(m.RoutingTable))
	}
	payload, err := proto.Marshal(&m)
	if err != nil {
		return nil
	}
	return payload
}

func combineBytes(bs ...[]byte) []byte {
	return bytes.Join(bs, []byte(""))
}

func (cmd updateWsnSettingsCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
