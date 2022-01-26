package po

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

type Display struct {
	Image    string `json:"image"`
	Location Point  `json:"location"`
}

func (s Display) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *Display) Scan(v interface{}) error {
	bytes, ok := v.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("failed to unmarshal Display value:", v))
	}
	return json.Unmarshal(bytes, s)
}

type Point struct {
	X float32 `json:"x"`
	Y float32 `json:"y"`
}

func (s Point) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *Point) Scan(v interface{}) error {
	bytes, ok := v.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("failed to unmarshal Point value:", v))
	}
	return json.Unmarshal(bytes, s)
}
