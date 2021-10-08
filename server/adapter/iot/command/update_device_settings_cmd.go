package command

import (
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

type UpdateDeviceSettingsCmd struct {
	command
	settings deviceSettings
}

func NewUpdateDeviceSettingsCmd(ipn po.IPNSetting, system po.SystemSetting, sensors po.SensorSetting) UpdateDeviceSettingsCmd {
	cmd := UpdateDeviceSettingsCmd{
		settings: deviceSettings{
			IPN:     ipn,
			System:  system,
			Sensors: sensors,
		},
	}
	cmd.command = newCommand()
	return cmd
}

func (cmd UpdateDeviceSettingsCmd) ID() string {
	return cmd.reqID
}

func (cmd UpdateDeviceSettingsCmd) Name() string {
	return "updateDeviceSettings"
}

func (cmd UpdateDeviceSettingsCmd) Qos() byte {
	return 1
}

func (cmd UpdateDeviceSettingsCmd) Payload() []byte {
	timestamp := time.Now().UTC().Unix()
	m := pd.UpdateDeviceSettingsCommand{
		ReqId:          cmd.ID(),
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

func (cmd UpdateDeviceSettingsCmd) Response() chan pd.GeneralResponseMessage {
	return cmd.response
}
