package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
)

type Alert struct {
	Title   string                 `json:"title"`
	Content string                 `json:"content"`
	Level   uint                   `json:"level"`
	Field   string                 `json:"field"`
	Data    map[string]interface{} `json:"data"`
}

func NewAlert(field string, level uint) Alert {
	return Alert{
		Field: field,
		Level: level,
		Data:  map[string]interface{}{},
	}
}

func (a *Alert) SetDevice(device entity.Device) {
	a.Data["device"] = map[string]interface{}{
		"id":   device.ID,
		"name": device.Name,
	}
}

func (a Alert) Notify() {
	eventbus.Publish(eventbus.SocketEmit, "socket::alert", a)
}
