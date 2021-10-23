package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
)

type Device struct {
	ID         uint                   `json:"id"`
	Name       string                 `json:"name"`
	MacAddress string                 `json:"macAddress"`
	TypeID     uint                   `json:"typeId"`
	Asset      *Asset                 `json:"asset,omitempty"`
	IPN        map[string]interface{} `json:"ipn,omitempty"`
	Sensors    map[string]interface{} `json:"sensors,omitempty"`
	System     map[string]interface{} `json:"system,omitempty"`
	WSN        map[string]interface{} `json:"wsn,omitempty"`
	Category   uint                   `json:"category"`

	Properties  []Property        `json:"properties"`
	Status      DeviceStatus      `json:"status"`
	Information DeviceInformation `json:"information"`
}

func NewDevice(e entity.Device) Device {
	d := Device{
		ID:         e.ID,
		Name:       e.Name,
		MacAddress: e.MacAddress,
		TypeID:     e.TypeID,
		Category:   uint(e.Category),
		IPN:        e.IPN,
		System:     e.System,
		Sensors:    e.Sensors,
		Status:     DeviceStatus{},
	}
	d.Status.DeviceConnectionState = e.GetConnectionState()
	return d
}

func (d *Device) SetAsset(e po.Asset) {
	d.Asset = &Asset{
		ID:   e.ID,
		Name: e.Name,
	}
}

func (d *Device) SetWSN(e entity.Network) {
	d.WSN = map[string]interface{}{
		"communication_period":      e.CommunicationPeriod,
		"communication_time_offset": e.CommunicationTimeOffset,
	}
}

func (d *Device) SetProperties(es []po.Property) {
	d.Properties = make([]Property, len(es))
	for i, e := range es {
		d.Properties[i] = NewProperty(e)
	}
}
