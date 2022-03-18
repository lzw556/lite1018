package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"time"
)

type AlertStatistic struct {
	Timestamp int64 `json:"timestamp"`
	Info      int   `json:"info"`
	Warn      int   `json:"warn"`
	Critical  int   `json:"critical"`
}

func NewAlertStatistic(time time.Time) AlertStatistic {
	return AlertStatistic{
		Timestamp: time.UTC().Unix(),
		Info:      0,
		Warn:      0,
		Critical:  0,
	}
}

func (a *AlertStatistic) Statistical(es []entity.AlarmRecord) {
	for _, e := range es {
		switch e.Level {
		case 1:
			a.Info++
		case 2:
			a.Warn++
		case 3:
			a.Critical++
		}
	}
}
