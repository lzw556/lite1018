package po

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

type AlarmRuleContent struct {
	Field     string  `json:"field"`
	Method    string  `json:"method"`
	Operation string  `json:"operation"`
	Threshold float32 `json:"threshold"`
}

func (s AlarmRuleContent) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *AlarmRuleContent) Scan(v interface{}) error {
	bytes, ok := v.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("failed to unmarshal AlarmRules value:", v))
	}
	return json.Unmarshal(bytes, s)
}
