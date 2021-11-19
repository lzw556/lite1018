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

	Information  DeviceInformation          `json:"information"`
	Properties   []Property                 `json:"properties"`
	State        DeviceState                `json:"state"`
	AccessState  uint                       `json:"accessState"`
	UpgradeState *entity.DeviceUpgradeState `json:"upgradeState,omitempty"`
	AlertState   DeviceAlertState           `json:"alertState,omitempty"`
}

func NewDevice(e entity.Device) Device {
	d := Device{
		ID:          e.ID,
		Name:        e.Name,
		MacAddress:  e.MacAddress,
		TypeID:      e.TypeID,
		Category:    uint(e.Category),
		IPN:         e.IPN,
		System:      e.System,
		Sensors:     e.Sensors,
		State:       DeviceState{},
		AccessState: e.NetworkID,
	}
	d.State.DeviceConnectionState = e.GetConnectionState()
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
