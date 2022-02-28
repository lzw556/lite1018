package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type Device struct {
	ID         uint                   `json:"id"`
	Name       string                 `json:"name"`
	MacAddress string                 `json:"macAddress"`
	TypeID     uint                   `json:"typeId"`
	IPN        map[string]interface{} `json:"ipn,omitempty"`
	Sensors    map[string]interface{} `json:"sensors,omitempty"`
	System     map[string]interface{} `json:"system,omitempty"`
	Category   uint                   `json:"category"`

	Network       *Network                    `json:"network,omitempty"`
	Information   entity.DeviceInformation    `json:"information"`
	State         entity.DeviceState          `json:"state"`
	Properties    Properties                  `json:"properties,omitempty"`
	UpgradeStatus *entity.DeviceUpgradeStatus `json:"upgradeStatus,omitempty"`
	AlertStates   []AlertState                `json:"alertStates,omitempty"`
}

func NewDevice(e entity.Device) Device {
	d := Device{
		ID:         e.ID,
		Name:       e.Name,
		MacAddress: e.MacAddress,
		TypeID:     e.Type,
	}
	return d
}

func (d *Device) SetNetwork(e entity.Network) {
	d.Network = &Network{
		ID:   e.ID,
		Name: e.Name,
	}
}

func (d *Device) SetUpgradeState(e entity.Device) {
	status := e.GetUpgradeStatus()
	switch status.Code {
	case entity.DeviceUpgradeError, entity.DeviceUpgradePending:
		d.UpgradeStatus = &status
	}
}

func (d *Device) SetAlertStates(es []entity.DeviceAlertState) {
	d.AlertStates = make([]AlertState, len(es))
	for i, e := range es {
		d.AlertStates[i].Rule.Level = e.Rule.Level
		d.AlertStates[i].Rule.ID = e.Rule.ID
		d.AlertStates[i].Record.ID = e.Record.ID
		d.AlertStates[i].Record.Value = e.Record.Value
	}
}
