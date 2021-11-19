package po

import (
	"database/sql/driver"
	"errors"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
)

var SensorSettingKeys = map[uint][]string{
	devicetype.BoltLooseningType: {
		"schedule0_sample_period",
	},
	devicetype.BoltElongationType: {
		"schedule0_sample_period",
		"speed_object",
		"pretightening_is_enabled",
		"initial_pretightening_force",
		"initial_pretightening_length",
		"pretightening_k",
		"elastic_modulus",
		"elastic_modulus",
		"sectional_area",
		"clamped_length",
	},
	devicetype.NormalTemperatureCorrosionType: {
		"schedule0_sample_period",
		"speed_object",
	},
	devicetype.HighTemperatureCorrosionType: {
		"schedule0_sample_period",
		"speed_object",
		"length_rod",
	},
	devicetype.VibrationTemperature3AxisType: {
		"schedule0_sample_period",
	},
	devicetype.AngleDipType: {
		"schedule0_sample_period",
	},
	devicetype.PressureTemperatureType: {
		"schedule0_sample_period",
	},
}

type SensorSetting map[string]interface{}

func (s SensorSetting) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *SensorSetting) Scan(v interface{}) error {
	bytes, ok := v.([]byte)
	if !ok {
		return errors.New(fmt.Sprint("failed to unmarshal IPN value:", v))
	}
	return json.Unmarshal(bytes, s)
}
