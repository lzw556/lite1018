package openapivo

import (
	"fmt"

	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
)

type Device struct {
	Mac            string                 `json:"mac,omitempty"`
	Name           string                 `json:"name,omitempty"`
	Type           uint                   `json:"type"`
	Settings       map[string]interface{} `json:"settings,omitempty"`
	Properties     []DeviceProperty       `json:"properties,omitempty"`
	Information    DeviceInformation      `json:"information,omitempty"`
	SignalLevel    float32                `json:"signalLevel"`
	BatteryVoltage int                    `json:"batteryVoltage"`
	IsOnline       bool                   `json:"isOnline"`
	ConnectedAt    int64                  `json:"connectedAt,omitempty"`
}

func NewDevice(e entity.Device) Device {
	device := Device{
		Mac:      e.MacAddress,
		Name:     e.Name,
		Type:     e.Type,
		Settings: map[string]interface{}{},
	}
	for _, setting := range e.Settings {
		key := fmt.Sprintf("%s_%s", setting.Category, setting.Key)
		device.Settings[key] = setting.Value
	}
	if t := devicetype.Get(e.Type); t != nil {
		properties := t.Properties(t.SensorID())
		device.Properties = make([]DeviceProperty, 0)
		for _, property := range properties {
			for _, field := range property.Fields {
				prop := DeviceProperty{
					Name: field.Name,
					Key:  field.Key,
					Unit: property.Unit,
				}
				if len(property.Fields) > 1 {
					prop.Name = fmt.Sprintf("%s(%s)", property.Name, field.Name)
				}
				device.Properties = append(device.Properties, prop)
			}
		}
	}
	return device
}

type DeviceInformation struct {
	Model           string `json:"model,omitempty"`
	FirmwareID      uint   `json:"firmwareId,omitempty"`
	FirmwareVersion string `json:"firmwareVersion,omitempty"`
	IPAddress       string `json:"ipAddress,omitempty"`
	SubnetMask      string `json:"subnetMask,omitempty"`
	Gateway         string `json:"gateway,omitempty"`
	IccID4G         string `json:"iccid4G,omitempty"`
}
