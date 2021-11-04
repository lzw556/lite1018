package command

import (
	"context"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"time"
)

type deviceSettings struct {
	IPN     po.IPNSetting    `json:"ipn,omitempty"`
	System  po.SystemSetting `json:"system,omitempty"`
	Sensors po.SensorSetting `json:"sensors,omitempty"`
}

type updateDeviceSettingsCmd struct {
	request
	settings deviceSettings
}

func newUpdateDeviceSettingsCmd(ipn po.IPNSetting, system po.SystemSetting, sensors po.SensorSetting) updateDeviceSettingsCmd {
	cmd := updateDeviceSettingsCmd{
		settings: deviceSettings{
			IPN:     ipn,
			System:  system,
			Sensors: sensors,
		},
	}
	cmd.request = newRequest()
	return cmd
}

func (cmd updateDeviceSettingsCmd) Name() string {
	return "updateDeviceSettings"
}

func (cmd updateDeviceSettingsCmd) Response() string {
	return "updateDeviceSettingsResponse"
}

func (cmd updateDeviceSettingsCmd) Qos() byte {
	return 1
}

func (cmd updateDeviceSettingsCmd) Payload() []byte {
	timestamp := time.Now().UTC().Unix()
	m := pd.UpdateDeviceSettingsCommand{
		ReqId:          cmd.reqID,
		Timestamp:      int32(timestamp),
		LastUpdateTime: int32(timestamp),
	}
	bytes, err := json.Marshal(cmd.settings)
	if err != nil {
		return nil
	}
	m.Settings = string(bytes)
	payload, err := proto.Marshal(&m)
	if err != nil {
		return nil
	}
	return payload
}

func (cmd updateDeviceSettingsCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) ([]byte, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
