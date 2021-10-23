package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"time"
)

type AlarmStatisticsQuery struct {
	po.AlarmRecords
}

func NewAlarmStatisticsQuery() AlarmStatisticsQuery {
	return AlarmStatisticsQuery{}
}

func (query AlarmStatisticsQuery) Query() vo.AlarmStatistics {
	temp := map[string][]po.AlarmRecord{}
	times := make([]string, 0)
	for _, record := range query.AlarmRecords {
		timeStr := record.CreatedAt.Format("2006-01-02")
		if _, ok := temp[timeStr]; !ok {
			temp[timeStr] = make([]po.AlarmRecord, 0)
			times = append(times, timeStr)
		}
		temp[timeStr] = append(temp[timeStr], record)
	}
	result := vo.NewAlarmStatistics()
	for i, t := range times {
		if date, err := time.Parse("2006-01-02", t); err == nil {
			result.AddTime(date)
			result.Statistical(i, temp[t])
		}

	}
	return result
}
