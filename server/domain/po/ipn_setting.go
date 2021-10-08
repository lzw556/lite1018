package po

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

var IPNSettingKeys = []string{
	"ip_mode",
	"ip_addr",
	"subnet_mask",
	"gateway_addr",
	"ntp_is_enabled",
	"ntp_addr",
}

type IPNSetting map[string]interface{}

func (s IPNSetting) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *IPNSetting) Scan(v interface{}) error {
	bytes, ok := v.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("failed to unmarshal IPN value:", v))
	}
	return json.Unmarshal(bytes, s)
}
