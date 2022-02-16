package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmTemplateQuery struct {
	entity.AlarmTemplate
}

func NewAlarmTemplateQuery() AlarmTemplateQuery {
	return AlarmTemplateQuery{}
}

func (query AlarmTemplateQuery) Detail() (*vo.AlarmTemplate, error) {
	result := vo.NewAlarmTemplate(query.AlarmTemplate)
	return &result, nil
}
