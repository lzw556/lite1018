package po

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

type Fields map[string]uint

func (f Fields) Value() (driver.Value, error) {
	return json.Marshal(f)
}

func (f *Fields) Scan(v interface{}) error {
	bytes, ok := v.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("failed to unmarshal Fields value:", v))
	}
	return json.Unmarshal(bytes, f)
}
