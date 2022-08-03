package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"time"
)

type DeviceEvent struct {
	ID        uint        `json:"id"`
	Name      string      `json:"name"`
	Message   interface{} `json:"message"`
	Content   string      `json:"content"`
	Timestamp int64       `json:"timestamp"`
	CreatedAt time.Time   `json:"-"`
}

func NewDeviceEvent(e entity.Event) DeviceEvent {
	event := DeviceEvent{
		ID:        e.ID,
		Name:      e.Code.String(),
		Content:   e.Content,
		Timestamp: e.CreatedAt.Unix(),
		CreatedAt: e.CreatedAt,
	}
	content := struct {
		Code int         `json:"code"`
		Data interface{} `json:"data"`
	}{}
	if err := json.Unmarshal([]byte(e.Content), &content); err != nil {
		return event
	}
	if message, ok := eventMessage[e.Code][content.Code]; ok {
		event.Message = message
	} else {
		event.Message = content.Data
	}
	return event
}

type DeviceEventList []DeviceEvent

func (list DeviceEventList) Len() int {
	return len(list)
}

func (list DeviceEventList) Less(i, j int) bool {
	return list[i].CreatedAt.UnixMilli() > list[j].CreatedAt.UnixMilli()
}

func (list DeviceEventList) Swap(i, j int) {
	list[i], list[j] = list[j], list[i]
}
