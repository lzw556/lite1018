package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmPagingQuery struct {
	entity.Alarms
	total int64
}

func NewAlarmPagingQuery(total int64) AlarmPagingQuery {
	return AlarmPagingQuery{
		total: total,
	}
}

func (query AlarmPagingQuery) Query() ([]vo.Alarm, int64) {
	result := make([]vo.Alarm, len(query.Alarms))
	for i, alarm := range query.Alarms {
		result[i] = vo.NewAlarm(alarm)
	}
	return result, query.total
}
