package vo

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"time"
)

type AlarmStatistics struct {
	Time      []int64 `json:"time"`
	Info      []uint  `json:"info"`
	Warn      []uint  `json:"warn"`
	Critical  []uint  `json:"critical"`
	Untreated []uint  `json:"untreated"`
	Resolved  []uint  `json:"resolved"`
	Recovered []uint  `json:"recovered"`
}

func NewAlarmStatistics() AlarmStatistics {
	return AlarmStatistics{
		Time:      make([]int64, 0),
		Info:      make([]uint, 0),
		Warn:      make([]uint, 0),
		Critical:  make([]uint, 0),
		Untreated: make([]uint, 0),
		Resolved:  make([]uint, 0),
		Recovered: make([]uint, 0),
	}
}

func (a *AlarmStatistics) AddTime(t time.Time) {
	a.Time = append(a.Time, t.Unix())
	a.Info = append(a.Info, 0)
	a.Warn = append(a.Warn, 0)
	a.Critical = append(a.Critical, 0)
	a.Untreated = append(a.Untreated, 0)
	a.Resolved = append(a.Resolved, 0)
	a.Recovered = append(a.Recovered, 0)
}

func (a *AlarmStatistics) Statistical(index int, records []entity.AlarmRecord) {
	for _, record := range records {
		switch record.Level {
		case 1:
			a.Info[index] += 1
		case 2:
			a.Warn[index] += 1
		case 3:
			a.Critical[index] += 1
		}
		switch record.Status {
		case po.AlarmRecordStatusUntreated:
			a.Untreated[index] += 1
		case po.AlarmRecordStatusResolved:
			a.Resolved[index] += 1
		case po.AlarmRecordStatusRecovered:
			a.Recovered[index] += 1
		}
	}
}
