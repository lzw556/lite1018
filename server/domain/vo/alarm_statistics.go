package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"time"
)

type AlarmStatistics struct {
	Time     []int64 `json:"time"`
	Info     []uint  `json:"info"`
	Warn     []uint  `json:"warn"`
	Critical []uint  `json:"critical"`
}

func NewAlarmStatistics() AlarmStatistics {
	return AlarmStatistics{
		Time:     make([]int64, 0),
		Info:     make([]uint, 0),
		Warn:     make([]uint, 0),
		Critical: make([]uint, 0),
	}
}

func (a *AlarmStatistics) AddTime(t time.Time) {
	a.Time = append(a.Time, t.Unix())
	a.Info = append(a.Info, 0)
	a.Warn = append(a.Warn, 0)
	a.Critical = append(a.Critical, 0)
}

func (a *AlarmStatistics) Statistical(index int, records []po.AlarmRecord) {
	for _, record := range records {
		switch record.Level {
		case 1:
			a.Info[index] += 1
		case 2:
			a.Warn[index] += 1
		case 3:
			a.Critical[index] += 1
		}
	}
}
