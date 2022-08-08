package command

import (
	"fmt"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

type wsnSettings struct {
	CommunicationPeriod  uint `json:"communication_period"`
	CommunicationPeriod2 uint `json:"communication_period_2"`
	CommunicationOffset  uint `json:"communication_offset"`
	GroupSize            uint `json:"group_size"`
	GroupSize2           uint `json:"group_size_2"`
	GroupInterval        uint `json:"group_interval"`
	Tempo                uint `json:"tempo"`
	CallPeriod           uint `json:"call_period"`
	ProvisioningMode     uint `json:"provisioning_mode"`
}

type updateWsnCmd struct {
	request
	settings wsnSettings
}

func newUpdateWsnSettingsCmd(network entity.Network) updateWsnCmd {
	return updateWsnCmd{
		request: newRequest(),
		settings: wsnSettings{
			CommunicationOffset:  network.CommunicationTimeOffset,
			CommunicationPeriod:  network.CommunicationPeriod,
			CommunicationPeriod2: network.CommunicationPeriod2,
			GroupInterval:        network.GroupInterval,
			GroupSize:            network.GroupSize,
			GroupSize2:           network.GroupSize2,
			Tempo:                network.Tempo,
			CallPeriod:           network.CallPeriod,
			ProvisioningMode:     uint(network.Mode),
		},
	}
}

func (cmd updateWsnCmd) ID() string {
	return cmd.request.id
}

func (cmd updateWsnCmd) Name() string {
	return "updateWsn"
}

func (cmd updateWsnCmd) Response() chan Response {
	return cmd.response
}

func (cmd updateWsnCmd) Qos() byte {
	return 1
}

func (cmd updateWsnCmd) Payload() ([]byte, error) {
	settings, err := json.Marshal(cmd.settings)
	if err != nil {
		return nil, err
	}
	m := pd.UpdateWsnCommand{
		ReqId:          cmd.request.id,
		Timestamp:      int32(cmd.request.timestamp),
		LastUpdateTime: int32(cmd.request.timestamp),
		Settings:       fmt.Sprintf(`{"wsn": %s}`, string(settings)),
	}
	return proto.Marshal(&m)
}

func (cmd updateWsnCmd) Execute(gateway string, target string, retained bool) (*Response, error) {
	return cmd.request.do(gateway, target, cmd, retained, 3)
}

func (cmd updateWsnCmd) AsyncExecute(gateway string, target string, retained bool) error {
	return cmd.request.doAsync(gateway, target, cmd, retained, 3)
}
