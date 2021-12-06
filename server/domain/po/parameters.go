package po

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

type Parameters map[string]interface{}

func (s Parameters) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *Parameters) Scan(v interface{}) error {
	bytes, ok := v.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("failed to unmarshal Parameters value:", v))
	}
	return json.Unmarshal(bytes, s)
}
