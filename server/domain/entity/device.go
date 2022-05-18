package entity

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"gorm.io/gorm"
)

type DeviceCategory uint

const (
	GatewayCategory DeviceCategory = iota + 1
	RouterCategory
	SensorCategory
)

type Device struct {
	gorm.Model
	Name       string `gorm:"type:varchar(64)"`
	MacAddress string `gorm:"type:varchar(12)"`
	Parent     string `gorm:"type:varchar(12)"`
	Type       uint
	NetworkID  uint
	ProjectID  uint
	Settings   DeviceSettings `gorm:"type:json"`

	State           DeviceState             `gorm:"-"`
	AlarmRuleStates map[uint]AlarmRuleState `gorm:"-"`
}

func (Device) TableName() string {
	return "ts_device"
}

func (d Device) GetUpgradeStatus() DeviceUpgradeStatus {
	status := DeviceUpgradeStatus{}
	if err := cache.GetStruct(fmt.Sprintf("device_upgrade_status_%d", d.ID), &status); err != nil {
		xlog.Errorf("failed to get device upgrade status: %v", err)
	}
	return status
}

func (d Device) UpdateDeviceUpgradeStatus(code DeviceUpgradeCode, progress float32) {
	status := DeviceUpgradeStatus{
		Code:     code,
		Progress: progress,
	}
	d.UpgradeNotify(status)
	if err := cache.SetStruct(fmt.Sprintf("device_upgrade_status_%d", d.ID), status); err != nil {
		xlog.Errorf("failed to update device upgrade status: %v => [%s]", err, d.MacAddress)
	}
}

func (d Device) CancelUpgrade() {
	status := d.GetUpgradeStatus()
	status.Code = DeviceUpgradeCancelled
	d.UpgradeNotify(status)
	if err := cache.SetStruct(fmt.Sprintf("device_upgrade_status_%d", d.ID), status); err != nil {
		xlog.Errorf("failed to set device upgrade status: %v => [%s]", err, d.MacAddress)
	}
}

func (d Device) UpgradeNotify(status DeviceUpgradeStatus) {
	eventbus.Publish(eventbus.SocketEmit, "socket::deviceUpgradeStatusChangedEvent", map[string]interface{}{
		"macAddress": d.MacAddress,
		"code":       status.Code,
		"progress":   status.Progress,
	})
}

func (d *Device) UpdateAlarmRuleState(e AlarmRule) {
	_ = cache.GetStruct(fmt.Sprintf("device_alarm_rule_state_%d", d.ID), &d.AlarmRuleStates)
	if d.AlarmRuleStates == nil {
		d.AlarmRuleStates = make(map[uint]AlarmRuleState)
	}
	if state, ok := d.AlarmRuleStates[e.ID]; ok {
		state.Level = e.Level
		state.Duration += 1
		d.AlarmRuleStates[e.ID] = state
	} else {
		if d.AlarmRuleStates[e.ID].Duration == e.Duration {

		}
		d.AlarmRuleStates[e.ID] = AlarmRuleState{
			Level:    e.Level,
			Duration: 1,
		}
	}
	_ = cache.SetStruct(fmt.Sprintf("device_alarm_rule_state_%d", d.ID), d.AlarmRuleStates)
}

func (d *Device) RemoveAlarmRuleState(id uint) {
	_ = cache.GetStruct(fmt.Sprintf("device_alarm_rule_state_%d", d.ID), &d.AlarmRuleStates)
	delete(d.AlarmRuleStates, id)
	_ = cache.SetStruct(fmt.Sprintf("device_alarm_rule_state_%d", d.ID), d.AlarmRuleStates)
}

func (d *Device) GetAlarmRuleState(id uint) AlarmRuleState {
	_ = cache.GetStruct(fmt.Sprintf("device_alarm_rule_state_%d", d.ID), &d.AlarmRuleStates)
	if d.AlarmRuleStates == nil {
		return AlarmRuleState{}
	}
	return d.AlarmRuleStates[id]
}

func (d Device) AlertNotify(m AlarmRuleMetric, value float64, level uint8) {
	eventbus.Publish(eventbus.SocketEmit, "socket::deviceAlertStateEvent", map[string]interface{}{
		"device": map[string]interface{}{
			"name":       d.Name,
			"macAddress": d.MacAddress,
		},
		"metric": m,
		"level":  level,
		"value":  value,
	})
}

func (d Device) IsGateway() bool {
	return d.Type == devicetype.GatewayType
}

func (d Device) IsRouter() bool {
	return d.Type == devicetype.RouterType
}

func (d Device) IsSVT() bool {
	return d.Type == devicetype.VibrationTemperature3AxisType || d.Type == devicetype.VibrationTemperature1AxisType
}

func (d Device) IsSA() bool {
	return d.Type == devicetype.BoltLooseningType
}

func (d Device) IsSAS() bool {
	return d.Type == devicetype.BoltElongationType
}

func (d Device) IsDC() bool {
	return d.Type == devicetype.NormalTemperatureCorrosionType || d.Type == devicetype.HighTemperatureCorrosionType
}

func (d Device) IsSQ() bool {
	return d.Type == devicetype.AngleDipType
}

type Devices []Device

func (ds Devices) Len() int {
	return len(ds)
}

func (ds Devices) Less(i, j int) bool {
	return ds[i].ID < ds[j].ID
}

func (ds Devices) Swap(i, j int) {
	ds[i], ds[j] = ds[j], ds[i]
}
