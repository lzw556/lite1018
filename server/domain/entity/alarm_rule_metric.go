package entity

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

type AlarmRuleMetric struct {
	Key  string `json:"key"`
	Name string `json:"name"`
	Unit string `json:"unit"`
}

func (s AlarmRuleMetric) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *AlarmRuleMetric) Scan(v interface{}) error {
	bytes, ok := v.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("failed to unmarshal AlarmRule Metric value:", v))
	}
	return json.Unmarshal(bytes, s)
}
