package query

import (
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmQuery struct {
	entity.AlarmRule
}

func NewAlarmQuery() AlarmQuery {
	return AlarmQuery{}
}

func (query AlarmQuery) Detail() *vo.Alarm {
	return nil
}
