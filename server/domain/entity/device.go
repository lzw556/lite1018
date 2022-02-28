package entity

import (
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
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
	_ = cache.GetStruct(fmt.Sprintf("device_upgrade_status_%d", d.ID), &status)
	return status
}

func (d Device) UpdateDeviceUpgradeStatus(code DeviceUpgradeCode, progress float32) {
	status := DeviceUpgradeStatus{
		Code:     code,
		Progress: progress,
	}
	d.UpgradeNotify(status)
	_ = cache.SetStruct(fmt.Sprintf("device_upgrade_status_%d", d.ID), status)
}

func (d Device) CancelUpgrade() {
	status := d.GetUpgradeStatus()
	status.Code = DeviceUpgradeCancelled
	d.UpgradeNotify(status)
	_ = cache.SetStruct(fmt.Sprintf("device_upgrade_status_%d", d.ID), status)
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

type Devices []Device
