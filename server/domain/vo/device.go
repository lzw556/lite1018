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
	IPN        map[string]interface{} `json:"ipn,omitempty"`
	Sensors    map[string]interface{} `json:"sensors,omitempty"`
	System     map[string]interface{} `json:"system,omitempty"`
	WSN        map[string]interface{} `json:"wsn,omitempty"`
	Category   uint                   `json:"category"`

	Network      *Network                   `json:"network,omitempty"`
	Information  DeviceInformation          `json:"information"`
	Properties   []Property                 `json:"properties"`
	State        DeviceState                `json:"state"`
	UpgradeState *entity.DeviceUpgradeState `json:"upgradeState,omitempty"`
	Binding      uint                       `json:"binding"`
	Data         DeviceData                 `json:"data"`
}

func NewDevice(e entity.Device) Device {
	d := Device{
		ID:         e.ID,
		Name:       e.Name,
		MacAddress: e.MacAddress,
		TypeID:     e.Type,
		Category:   uint(e.Category),
		State:      DeviceState{},
	}
	d.State.DeviceConnectionState = e.GetConnectionState()
	return d
}

func (d *Device) SetNetwork(e entity.Network) {
	d.Network = &Network{
		ID:   e.ID,
		Name: e.Name,
	}
}

func (d *Device) SetWSN(e entity.Network) {
	d.WSN = map[string]interface{}{
		"communication_period":      e.CommunicationPeriod,
		"communication_time_offset": e.CommunicationTimeOffset,
		"group_size":                e.GroupSize,
		"group_interval":            e.GroupInterval,
	}
}

func (d *Device) SetProperties(es []po.Property) {
	d.Properties = make([]Property, len(es))
	for i, e := range es {
		d.Properties[i] = NewProperty(e)
	}
}

func (d *Device) SetUpgradeState(e entity.Device) {
	upgradeState := e.GetUpgradeState()
	switch upgradeState.Status {
	case entity.DeviceUpgradeStatusError, entity.DeviceUpgradeStatusPending:
		d.UpgradeState = &upgradeState
	}
}

func (d *Device) SetBinding(e po.MeasurementDeviceBinding) {
	d.Binding = e.MeasurementID
}

func (d *Device) SetData(e entity.SensorData) {
	d.Data = NewDeviceData(e)
}
