package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmTemplateQuery struct {
	po.AlarmTemplate

	propertyRepo dependency.PropertyRepository
}

func NewAlarmTemplateQuery() AlarmTemplateQuery {
	return AlarmTemplateQuery{
		propertyRepo: repository.Property{},
	}
}

func (query AlarmTemplateQuery) Detail() (*vo.AlarmTemplate, error) {
	result := vo.NewAlarmTemplate(query.AlarmTemplate)
	return &result, nil
}
