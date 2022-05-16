package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmRuleQuery struct {
	Specs spec.Specifications

	alarmRuleRepo        dependency.AlarmRuleRepository
	alarmSourceRepo      dependency.AlarmSourceRepository
	deviceRepo           dependency.DeviceRepository
	deviceAlertStateRepo dependency.DeviceAlertStateRepository
}

func NewAlarmRuleQuery() AlarmRuleQuery {
	return AlarmRuleQuery{
		alarmRuleRepo:        repository.AlarmRule{},
		alarmSourceRepo:      repository.AlarmSource{},
		deviceRepo:           repository.Device{},
		deviceAlertStateRepo: repository.DeviceAlertState{},
	}
}

func (query AlarmRuleQuery) Paging(page, size int) ([]vo.AlarmRule, int64, error) {
	es, total, err := query.alarmRuleRepo.PagingBySpecs(context.TODO(), page, size, query.Specs...)
	if err != nil {
		return nil, 0, err
	}
	result := make([]vo.AlarmRule, len(es))
	for i, e := range es {
		result[i] = vo.NewAlarmRule(e)
		query.setSources(&result[i])
	}
	return result, total, nil
}

func (query AlarmRuleQuery) List() ([]vo.AlarmRule, error) {
	es, err := query.alarmRuleRepo.FindBySpecs(context.TODO(), query.Specs...)
	if err != nil {
		return nil, err
	}
	result := make([]vo.AlarmRule, len(es))
	for i, e := range es {
		result[i] = vo.NewAlarmRule(e)
	}
	return result, nil
}

func (query AlarmRuleQuery) Get(id uint) (*vo.AlarmRule, error) {
	e, err := query.alarmRuleRepo.Get(context.TODO(), id)
	if err != nil {
		return nil, err
	}
	result := vo.NewAlarmRule(e)
	query.setSources(&result)
	return &result, nil
}

func (query AlarmRuleQuery) setSources(alarmRule *vo.AlarmRule) {
	sourceIDs := make([]uint, 0)
	if es, err := query.alarmSourceRepo.FindBySpecs(context.TODO(), spec.AlarmRuleEqSpec(alarmRule.ID)); err == nil {
		for _, source := range es {
			sourceIDs = append(sourceIDs, source.SourceID)
		}
	}
	if alarmRule.Category == uint8(entity.AlarmRuleCategoryDevice) {
		es, err := query.deviceRepo.FindBySpecs(context.TODO(), spec.PrimaryKeyInSpec(sourceIDs))
		if err != nil {
			return
		}
		sources := make([]vo.Device, len(es))
		for i, device := range es {
			sources[i] = vo.NewDevice(device)
			if alerts, err := query.deviceAlertStateRepo.Find(device.MacAddress); err == nil {
				sources[i].SetAlertStates(alerts)
			}
		}
		alarmRule.Sources = sources
	}
}
