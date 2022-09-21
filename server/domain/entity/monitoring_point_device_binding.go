package entity

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"gorm.io/gorm"
)

type AlgorithmParameters map[string]interface{}

type MonitoringPointDeviceBinding struct {
	gorm.Model
	MonitoringPointID uint
	DeviceID          uint
	ProcessID         uint
	Parameters        AlgorithmParameters `gorm:"type:json"`
}

func (MonitoringPointDeviceBinding) TableName() string {
	return "ts_monitoring_point_device_binding"
}

func (p *AlgorithmParameters) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("Failed to unmarshal algorithmParameters value:", value))
	}
	return json.Unmarshal(bytes, &p)
}

func (p AlgorithmParameters) Value() (driver.Value, error) {
	return json.Marshal(p)
}
