package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmRecordQuery struct {
	entity.AlarmRecord

	alarmRecordAcknowledgeRepo dependency.AlarmRecordAcknowledgeRepository
	userRepo                   dependency.UserRepository
}

func NewAlarmRecordQuery() AlarmRecordQuery {
	return AlarmRecordQuery{
		alarmRecordAcknowledgeRepo: repository.AlarmRecordAcknowledge{},
		userRepo:                   repository.User{},
	}
}

func (query AlarmRecordQuery) Detail() (*vo.AlarmRecord, error) {
	result := vo.NewAlarmRecord(query.AlarmRecord)
	return &result, nil
}

func (query AlarmRecordQuery) GetAcknowledge() (*vo.AlarmRecordAcknowledge, error) {
	ctx := context.TODO()
	e, err := query.alarmRecordAcknowledgeRepo.GetSpecs(ctx, spec.AlarmRecordEqSpec(query.AlarmRecord.ID))
	if err != nil {
		return nil, err
	}
	result := vo.NewAlarmRecordAcknowledge(e)
	if user, err := query.userRepo.Get(ctx, e.UserID); err == nil {
		result.SetUser(user)
	}
	return &result, nil
}
