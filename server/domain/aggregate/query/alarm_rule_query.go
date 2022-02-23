package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"strings"
)

type AlarmRuleQuery struct {
	Specs spec.Specifications

	alarmRuleRepo   dependency.AlarmRuleRepository
	alarmSourceRepo dependency.AlarmSourceRepository
	deviceRepo      dependency.DeviceRepository
}

func NewAlarmRuleQuery() AlarmRuleQuery {
	return AlarmRuleQuery{
		alarmRuleRepo:   repository.AlarmRule{},
		alarmSourceRepo: repository.AlarmSource{},
		deviceRepo:      repository.Device{},
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
	}
	return result, total, nil
}

func (query AlarmRuleQuery) Get(id uint) (*vo.AlarmRule, error) {
	e, err := query.alarmRuleRepo.Get(context.TODO(), id)
	if err != nil {
		return nil, err
	}
	result := vo.NewAlarmRule(e)
	sourceIDs := make([]uint, 0)
	if es, err := query.alarmSourceRepo.FindBySpecs(context.TODO(), spec.AlarmRuleEqSpec(e.ID)); err == nil {
		for _, source := range es {
			sourceIDs = append(sourceIDs, source.SourceID)
		}
	}
	if strings.HasPrefix(result.SourceType, entity.AlarmSourceTypeDevice) {
		es, err := query.deviceRepo.FindBySpecs(context.TODO(), spec.PrimaryKeyInSpec(sourceIDs))
		if err != nil {
			return nil, err
		}
		sources := make([]vo.Device, len(es))
		for i, device := range es {
			sources[i] = vo.NewDevice(device)
		}
		result.Sources = sources
	}
	return &result, nil
}

func (query AlarmRuleQuery) getSources(ids []uint, typ string) []vo.AlarmSource {
	var result []vo.AlarmSource
	switch typ {
	case entity.AlarmSourceTypeDevice:
		es, err := query.deviceRepo.FindBySpecs(context.TODO(), spec.PrimaryKeyInSpec(ids))
		if err != nil {
			return nil
		}
		result = make([]vo.AlarmSource, len(es))
		for i, e := range es {
			result[i] = vo.AlarmSource{
				ID:   e.ID,
				Name: e.Name,
			}
		}
	}
	return result
}
