package vo

import (
	"time"

	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type DeviceEvent struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	Content   string    `json:"content"`
	Message   string    `json:"message"`
	Timestamp int64     `json:"timestamp"`
	CreatedAt time.Time `json:"-"`
}

func NewDeviceEvent(e entity.Event) DeviceEvent {
	event := DeviceEvent{
		ID:        e.ID,
		Message:   e.Message,
		Content:   eventContent[e.Type][e.Code],
		Timestamp: e.CreatedAt.Unix(),
		CreatedAt: e.CreatedAt,
	}
	switch e.Type {
	case entity.EventTypeDataQcquisition:
		event.Name = "数据采集失事件"
	case entity.EventTypeSensorQcquisition:
		event.Name = "传感器采集事件"
	case entity.EventTypeSensorAlarm:
		event.Name = "传感器报警事件"
	case entity.EventTypeSensorCalibrate:
		event.Name = "传感器校准事件"
	case entity.EventTypeDeviceLowPower:
		event.Name = "低电量事件"
	case entity.EventTypeDeviceReboot:
		event.Name = "重启事件"
	case entity.EventTypeDeviceStatus:
		event.Name = "状态变更事件"
	case entity.EventTypeDeviceUpgrade:
		event.Name = "升级事件"
	case entity.EventTypeFirmwareError:
		event.Name = "硬件错误事件"
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
