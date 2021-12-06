package po

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

type MeasurementDeviceBinding map[uint]uint

func (s MeasurementDeviceBinding) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *MeasurementDeviceBinding) Scan(v interface{}) error {
	bytes, ok := v.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("failed to unmarshal MeasurementDeviceBinding value:", v))
	}
	return json.Unmarshal(bytes, s)
}
