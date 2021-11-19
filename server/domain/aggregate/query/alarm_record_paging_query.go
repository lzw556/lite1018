package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmRecordPagingQuery struct {
	entity.AlarmRecords

	total         int64
	deviceRepo    dependency.DeviceRepository
	propertyRepo  dependency.PropertyRepository
	alarmRuleRepo dependency.AlarmRuleRepository
}

func NewAlarmRecordPagingQuery(total int64) AlarmRecordPagingQuery {
	return AlarmRecordPagingQuery{
		total:         total,
		deviceRepo:    repository.Device{},
		propertyRepo:  repository.Property{},
		alarmRuleRepo: repository.AlarmRule{},
	}
}

func (query AlarmRecordPagingQuery) Paging() ([]vo.AlarmRecord, int64) {
	ctx := context.TODO()
	result := make([]vo.AlarmRecord, len(query.AlarmRecords))
	deviceMap := map[uint]entity.Device{}
	propertyMap := map[uint]po.Property{}
	alarmRuleMap := map[uint]po.AlarmRule{}
	for i, e := range query.AlarmRecords {
		if _, ok := deviceMap[e.DeviceID]; !ok {
			deviceMap[e.DeviceID], _ = query.deviceRepo.Get(ctx, e.DeviceID)
		}
		if _, ok := propertyMap[e.PropertyID]; !ok {
			propertyMap[e.PropertyID], _ = query.propertyRepo.Get(ctx, e.PropertyID)
		}
		if _, ok := alarmRuleMap[e.AlarmID]; !ok {
			alarmRuleMap[e.AlarmID], _ = query.alarmRuleRepo.Get(ctx, e.AlarmID)
		}
		result[i] = vo.NewAlarmRecord(e)
		result[i].SetDevice(deviceMap[e.DeviceID])
		result[i].SetProperty(propertyMap[e.PropertyID])
		result[i].Name = alarmRuleMap[e.AlarmID].Name
	}
	return result, query.total
}
