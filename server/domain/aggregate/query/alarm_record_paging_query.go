package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmRecordPagingQuery struct {
	entity.AlarmRecords

	total     int64
	alarmRepo dependency.AlarmRuleRepository
}

func NewAlarmRecordPagingQuery(total int64) AlarmRecordPagingQuery {
	return AlarmRecordPagingQuery{
		total:     total,
		alarmRepo: repository.AlarmRule{},
	}
}

func (query AlarmRecordPagingQuery) Paging() ([]vo.AlarmRecord, int64) {
	result := make([]vo.AlarmRecord, len(query.AlarmRecords))
	for i, e := range query.AlarmRecords {
		result[i] = vo.NewAlarmRecord(e)
	}
	return result, query.total
}
