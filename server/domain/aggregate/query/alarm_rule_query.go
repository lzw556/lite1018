package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmRuleQuery struct {
	po.AlarmRule

	deviceRepo   dependency.DeviceRepository
	propertyRepo dependency.PropertyRepository
}

func NewAlarmRuleQuery() AlarmRuleQuery {
	return AlarmRuleQuery{
		deviceRepo:   repository.Device{},
		propertyRepo: repository.Property{},
	}
}

func (query AlarmRuleQuery) Detail() *vo.AlarmRule {
	ctx := context.TODO()
	result := vo.NewAlarmRule(query.AlarmRule)
	if device, err := query.deviceRepo.Get(ctx, query.AlarmRule.DeviceID); err == nil {
		result.SetDevice(device)
	}
	if property, err := query.propertyRepo.Get(ctx, query.AlarmRule.PropertyID); err == nil {
		result.SetProperty(property)
	}
	return &result
}
