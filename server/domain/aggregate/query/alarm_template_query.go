package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmTemplateQuery struct {
	po.AlarmTemplate
}

func NewAlarmTemplateQuery() AlarmTemplateQuery {
	return AlarmTemplateQuery{}
}

func (query AlarmTemplateQuery) Detail() (*vo.AlarmTemplate, error) {
	result := vo.NewAlarmTemplate(query.AlarmTemplate)
	return &result, nil
}
