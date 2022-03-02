package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"sort"
)

type DeviceSetting struct {
	Name     string         `json:"name"`
	Key      string         `json:"key"`
	Category string         `json:"category"`
	Value    interface{}    `json:"value"`
	Type     string         `json:"type"`
	Options  map[int]string `json:"options,omitempty"`
	Unit     string         `json:"unit"`
	Children DeviceSettings `json:"children"`
	Show     interface{}    `json:"show"`
	Sort     int            `json:"sort"`
	Group    string         `json:"group"`
}

func NewDeviceSetting(e devicetype.Setting) DeviceSetting {
	return DeviceSetting{
		Name:     e.Name,
		Key:      e.Key,
		Value:    e.Value,
		Type:     e.Type,
		Unit:     e.Unit,
		Options:  e.Options,
		Show:     e.Show,
		Category: string(e.Category),
		Sort:     e.Sort,
		Group:    e.Group,
	}
}

type DeviceSettings []DeviceSetting

func NewDeviceSettings(es devicetype.Settings) DeviceSettings {
	settings := make(DeviceSettings, 0)
	for _, e := range es {
		if e.Parent == "" {
			setting := NewDeviceSetting(e)
			setting.AddChildren(es)
			settings = append(settings, setting)
		}
	}
	sort.Sort(settings)
	return settings
}

func (d *DeviceSetting) AddChildren(es devicetype.Settings) {
	for _, e := range es {
		if e.Parent == d.Key {
			child := NewDeviceSetting(e)
			child.AddChildren(es)
			sort.Sort(child.Children)
			d.Children = append(d.Children, child)
		}
	}
}

func (d DeviceSettings) Len() int {
	return len(d)
}

func (d DeviceSettings) Less(i, j int) bool {
	return d[i].Sort < d[j].Sort
}

func (d DeviceSettings) Swap(i, j int) {
	d[i], d[j] = d[j], d[i]
}
