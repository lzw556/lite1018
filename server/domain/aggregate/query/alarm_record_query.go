package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmRecordQuery struct {
	po.AlarmRecord

	propertyRepo dependency.PropertyRepository
}

func NewAlarmRecordQuery() AlarmRecordQuery {
	return AlarmRecordQuery{
		propertyRepo: repository.Property{},
	}
}

func (query AlarmRecordQuery) Detail() (*vo.AlarmRecord, error) {
	ctx := context.TODO()
	result := vo.NewAlarmRecord(query.AlarmRecord)
	property, err := query.propertyRepo.Get(ctx, query.AlarmRecord.PropertyID)
	if err != nil {
		return nil, err
	}
	result.SetProperty(property)
	return &result, nil
}
