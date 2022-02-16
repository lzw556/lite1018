package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
)

type LargeSensorData struct {
	Timestamp int64 `json:"timestamp"`
}

func NewLargeSensorData(e entity.LargeSensorData) LargeSensorData {
	return LargeSensorData{
		Timestamp: e.Time.Unix(),
	}
}

type LargeSensorDataList []LargeSensorData

func (list LargeSensorDataList) Len() int {
	return len(list)
}

func (list LargeSensorDataList) Less(i, j int) bool {
	return list[i].Timestamp > list[j].Timestamp
}

func (list LargeSensorDataList) Swap(i, j int) {
	list[i], list[j] = list[j], list[i]
}
