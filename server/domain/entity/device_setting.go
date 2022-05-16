package entity

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

type DeviceSetting struct {
	Key      string      `json:"key"`
	Value    interface{} `json:"value"`
	Category string      `json:"category"`
}

type DeviceSettings []DeviceSetting

func (s DeviceSettings) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *DeviceSettings) Scan(v interface{}) error {
	bytes, ok := v.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("failed to unmarshal Device Settings value:", v))
	}
	return json.Unmarshal(bytes, s)
}

func (s DeviceSettings) Get(key string) (DeviceSetting, bool) {
	for _, setting := range s {
		if setting.Key == key {
			return setting, true
		}
	}
	return DeviceSetting{}, false
}
