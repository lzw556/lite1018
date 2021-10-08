package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type DeviceSetting struct {
	IPN     map[string]interface{} `json:"ipn,omitempty"`
	System  map[string]interface{} `json:"system,omitempty"`
	Sensors map[string]interface{} `json:"sensors,omitempty"`
	WSN     map[string]uint        `json:"wsn,omitempty"`
}

func NewDeviceSetting(e entity.Device) DeviceSetting {
	return DeviceSetting{
		IPN:     e.IPN,
		System:  e.System,
		Sensors: e.Sensors,
	}
}

func (s *DeviceSetting) SetNetwork(e entity.Network) {
	s.WSN = map[string]uint{
		"communication_period":      e.CommunicationPeriod,
		"communication_time_offset": e.CommunicationTimeOffset,
	}
}
