package command

import (
	"context"
	"github.com/gogo/protobuf/proto"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"time"
)

type deviceSettings struct {
	IPN     map[string]interface{} `json:"ipn,omitempty"`
	System  map[string]interface{} `json:"system,omitempty"`
	Sensors map[string]interface{} `json:"sensors,omitempty"`
}

type updateDeviceSettingsCmd struct {
	request
	settings deviceSettings
}

func newUpdateDeviceSettingsCmd(settings entity.DeviceSettings) updateDeviceSettingsCmd {
	cmd := updateDeviceSettingsCmd{
		settings: deviceSettings{
			IPN:     map[string]interface{}{},
			System:  map[string]interface{}{},
			Sensors: map[string]interface{}{},
		},
	}
	for _, setting := range settings {
		switch devicetype.SettingCategory(setting.Category) {
		case devicetype.IpnSettingCategory:
			cmd.settings.IPN[setting.Key] = setting.Value
		case devicetype.SensorsSettingCategory:
			cmd.settings.Sensors[setting.Key] = setting.Value
		case devicetype.SystemSettingCategory:
			cmd.settings.System[setting.Key] = setting.Value
		}
	}
	cmd.request = newRequest()
	return cmd
}

func (cmd updateDeviceSettingsCmd) ID() string {
	return cmd.request.id
}

func (cmd updateDeviceSettingsCmd) Name() string {
	return "updateDeviceSettings"
}

func (cmd updateDeviceSettingsCmd) Response() chan Response {
	return cmd.response
}

func (cmd updateDeviceSettingsCmd) Qos() byte {
	return 1
}

func (cmd updateDeviceSettingsCmd) Payload() ([]byte, error) {
	m := pd.UpdateDeviceSettingsCommand{
		ReqId:          cmd.request.id,
		Timestamp:      int32(cmd.request.timestamp),
		LastUpdateTime: int32(cmd.request.timestamp),
	}
	bytes, err := json.Marshal(cmd.settings)
	if err != nil {
		return nil, err
	}
	m.Settings = string(bytes)
	return proto.Marshal(&m)
}

func (cmd updateDeviceSettingsCmd) Execute(ctx context.Context, gateway string, target string, timeout time.Duration) (*Response, error) {
	return cmd.request.do(ctx, gateway, target, cmd, timeout)
}
