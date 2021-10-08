package po

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

type SystemSetting map[string]interface{}

func (s SystemSetting) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *SystemSetting) Scan(v interface{}) error {
	bytes, ok := v.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("failed to unmarshal IPN value:", v))
	}
	return json.Unmarshal(bytes, s)
}
