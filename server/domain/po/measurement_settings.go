package po

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

type MeasurementSettings map[string]interface{}

func (s MeasurementSettings) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *MeasurementSettings) Scan(v interface{}) error {
	bytes, ok := v.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("failed to unmarshal MeasurementSettings value:", v))
	}
	return json.Unmarshal(bytes, s)
}
