package entity

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

type Settings map[string]interface{}

func (s Settings) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *Settings) Scan(v interface{}) error {
	bytes, ok := v.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("failed to unmarshal Settings value:", v))
	}
	return json.Unmarshal(bytes, s)
}
