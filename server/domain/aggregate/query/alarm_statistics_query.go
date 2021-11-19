package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"time"
)

type AlarmStatisticsQuery struct {
	entity.AlarmRecords
	Times []time.Time
}

func NewAlarmStatisticsQuery() AlarmStatisticsQuery {
	return AlarmStatisticsQuery{}
}

func (query AlarmStatisticsQuery) Query() vo.AlarmStatistics {
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
	result := vo.NewAlarmStatistics()
	for i, t := range query.Times {
		result.AddTime(t)
		if statistic, ok := temp[t.Format("2006-01-02")]; ok {
			result.Statistical(i, statistic)
		}
	}
	return result
}
