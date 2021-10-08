package command

import (
	"fmt"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"time"
)

type wsnSettings struct {
	CommunicationPeriod     uint `json:"communication_period"`
	JobPeriod               uint `json:"job_period"`
	CommunicationTimeOffset uint `json:"communication_time_offset"`
}

type UpdateWsnSettingsCmd struct {
	command
	settings        wsnSettings
	routingTable    po.RoutingTables
	isUpdateWsnOnly bool
}

func NewUpdateWsnSettingsCmd(network entity.Network, isUpdateWsnOnly bool) UpdateWsnSettingsCmd {
	cmd := UpdateWsnSettingsCmd{
		isUpdateWsnOnly: isUpdateWsnOnly,
		settings: wsnSettings{
			CommunicationTimeOffset: network.CommunicationTimeOffset,
			CommunicationPeriod:     network.CommunicationPeriod,
			JobPeriod:               network.CommunicationPeriod,
		},
		routingTable: network.RoutingTables,
	}
	cmd.command = newCommand()
	return cmd
}

func (cmd UpdateWsnSettingsCmd) ID() string {
	return cmd.reqID
}

func (cmd UpdateWsnSettingsCmd) Name() string {
	return "updateWsnSettings"
}

func (cmd UpdateWsnSettingsCmd) Qos() byte {
	return 1
}

func (cmd UpdateWsnSettingsCmd) Payload() []byte {
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
		b, err := json.Marshal(cmd.routingTable)
		if err != nil {
			return nil
		}
		m.RoutingTableLength = int32(len(b))
		m.RoutingTable = b
	}
	bytes, err := proto.Marshal(&m)
	if err != nil {
		return nil
	}
	return bytes
}

func (cmd UpdateWsnSettingsCmd) Response() chan pd.GeneralResponseMessage {
	return cmd.response
}
