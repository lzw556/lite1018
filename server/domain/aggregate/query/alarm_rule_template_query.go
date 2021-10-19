package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmRuleTemplateQuery struct {
	po.AlarmRuleTemplate

	propertyRepo dependency.PropertyRepository
}

func NewAlarmRuleTemplateQuery() AlarmRuleTemplateQuery {
	return AlarmRuleTemplateQuery{
		propertyRepo: repository.Property{},
	}
}

func (query AlarmRuleTemplateQuery) Detail() (*vo.AlarmRuleTemplate, error) {
	ctx := context.TODO()
	result := vo.NewAlarmRuleTemplate(query.AlarmRuleTemplate)
	property, err := query.propertyRepo.Get(ctx, query.AlarmRuleTemplate.PropertyID)
	if err != nil {
		return nil, err
	}
	result.SetProperty(property)
	result.SetRule(query.AlarmRuleTemplate.Rule)
	return &result, nil
}
