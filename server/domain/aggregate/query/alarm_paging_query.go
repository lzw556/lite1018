package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmPagingQuery struct {
	total int64
}

func NewAlarmPagingQuery(total int64) AlarmPagingQuery {
	return AlarmPagingQuery{
		total: total,
	}
}

func (query AlarmPagingQuery) Query() ([]vo.Alarm, int64) {
	return nil, query.total
}
