package devicetype

import (
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype/validator"
)

const (
	Uint8ValueType  = "uint8"
	Uint16ValueType = "uint16"
	Uint32ValueType = "uint32"
	Uint64ValueType = "uint64"
	BoolValueType   = "bool"
	FloatValueType  = "float"
	StringValueType = "string"
)

type SettingCategory string

const (
	WsnSettingCategory     SettingCategory = "wsn"
	IpnSettingCategory     SettingCategory = "ipn"
	SensorsSettingCategory SettingCategory = "sensors"
	SystemSettingCategory  SettingCategory = "system"
)

const (
	SettingGroupGeneral      = "general"
	SettingGroupNetwork      = "network"
	SettingGroupPreload      = "preload"
	SettingGroupCorrosion    = "corrosion"
	SettingGroupAcceleration = "acceleration"
	SettingGroupInclinometer = "inclinometer"
	SettingGroupThickness    = "thickness"
	SettingGroupOther        = "other"
)

type Setting struct {
	Name      string              `json:"name"`
	Key       string              `json:"key"`
	Value     interface{}         `json:"value"`
	Type      string              `json:"type"`
	Unit      string              `json:"unit"`
	Category  SettingCategory     `json:"category"`
	Options   map[int]string      `json:"options"`
	Group     string              `json:"group,omitempty"`
	Sort      int                 `json:"sort"`
	Parent    string              `json:"parent,omitempty"`
	Show      interface{}         `json:"show"`
	Validator validator.Validator `json:"validator"`
}

func (s Setting) Convert(value interface{}) interface{} {
	switch s.Type {
	case Uint8ValueType:
		return cast.ToUint8(value)
	case Uint16ValueType:
		return cast.ToUint16(value)
	case Uint32ValueType:
		return cast.ToUint32(value)
	case Uint64ValueType:
		return cast.ToUint64(value)
	case BoolValueType:
		return cast.ToBool(value)
	case FloatValueType:
		return cast.ToFloat32(value)
	default:
		return cast.ToString(value)
	}
}

func (s Setting) Validate() bool {
	if s.Validator != nil {
		return s.Validator.Validate(s.Value)
	}
	return true
}

func samplePeriodSetting() Setting {
	return Setting{
		Name:     "采集周期",
		Key:      "sample_period",
		Category: SensorsSettingCategory,
		Value:    3600000, // 1 hour
		Type:     Uint32ValueType,
		Options:  samplePeriodOptions,
		Group:    SettingGroupGeneral,
		Sort:     0,
	}
}

func sampleOffsetSetting() Setting {
	return Setting{
		Name:     "采集延迟",
		Key:      "sample_offset",
		Category: SensorsSettingCategory,
		Value:    0,
		Type:     Uint32ValueType,
		Options:  sampleOffsetOptions,
		Group:    SettingGroupGeneral,
		Sort:     1,
	}
}

func temperatureKSetting(name, key string, v interface{}, sort int, group string) Setting {
	return Setting{
		Name:     name,
		Key:      key,
		Category: SensorsSettingCategory,
		Value:    v,
		Type:     FloatValueType,
		Group:    group,
		Sort:     sort,
	}
}

type Settings []Setting

func (s Settings) Get(key string) (Setting, bool) {
	for _, setting := range s {
		if setting.Key == key {
			return setting, true
		}
	}
	return Setting{}, false
}

func (s Settings) Len() int {
	return len(s)
}

func (s Settings) Less(i, j int) bool {
	return s[i].Sort < s[j].Sort
}

func (s Settings) Swap(i, j int) {
	s[i], s[j] = s[j], s[i]
}
