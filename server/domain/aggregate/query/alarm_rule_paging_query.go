package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmRulePagingQuery struct {
	po.AlarmRules
	total int64

	deviceRepo   dependency.DeviceRepository
	propertyRepo dependency.PropertyRepository
}

func NewAlarmRulePagingQuery(total int64) AlarmRulePagingQuery {
	return AlarmRulePagingQuery{
		total:        total,
		deviceRepo:   repository.Device{},
		propertyRepo: repository.Property{},
	}
}

func (query AlarmRulePagingQuery) Query() ([]vo.AlarmRule, int64) {
	ctx := context.TODO()
	result := make([]vo.AlarmRule, len(query.AlarmRules))
	deviceMap := map[uint]entity.Device{}
	propertyMap := map[uint]po.Property{}
	for i, alarmRule := range query.AlarmRules {
		result[i] = vo.NewAlarmRule(alarmRule)
		if _, ok := deviceMap[alarmRule.DeviceID]; !ok {
			deviceMap[alarmRule.DeviceID], _ = query.deviceRepo.Get(ctx, alarmRule.DeviceID)
		}
		if _, ok := propertyMap[alarmRule.PropertyID]; !ok {
			propertyMap[alarmRule.PropertyID], _ = query.propertyRepo.Get(ctx, alarmRule.PropertyID)
		}
		result[i].SetDevice(deviceMap[alarmRule.DeviceID])
		result[i].SetProperty(propertyMap[alarmRule.PropertyID])
	}
	return result, query.total
}
