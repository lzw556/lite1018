package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"time"
)

type AlarmRecordStatisticsQuery struct {
	entity.AlarmRecords
	Times []time.Time
}

func NewAlarmRecordStatisticsQuery() AlarmRecordStatisticsQuery {
	return AlarmRecordStatisticsQuery{}
}

func (query AlarmRecordStatisticsQuery) Query() vo.AlarmRecordStatistics {
	temp := map[string][]entity.AlarmRecord{}
	times := make([]string, 0)
	for _, record := range query.AlarmRecords {
		timeStr := record.CreatedAt.Format("2006-01-02")
		if _, ok := temp[timeStr]; !ok {
			temp[timeStr] = make([]entity.AlarmRecord, 0)
			times = append(times, timeStr)
		}
		temp[timeStr] = append(temp[timeStr], record)
	}
	result := vo.NewAlarmRecordStatistics()
	for i, t := range query.Times {
		result.AddTime(t)
		if statistic, ok := temp[t.Format("2006-01-02")]; ok {
			result.Statistical(i, statistic)
		}
	}
	return result
}
