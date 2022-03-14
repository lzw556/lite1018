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

type AlarmRecordQuery struct {
	Specs []spec.Specification

	alarmRecordRepo            dependency.AlarmRecordRepository
	alarmRecordAcknowledgeRepo dependency.AlarmRecordAcknowledgeRepository
	deviceRepo                 dependency.DeviceRepository
	userRepo                   dependency.UserRepository
}

func NewAlarmRecordQuery() AlarmRecordQuery {
	return AlarmRecordQuery{
		alarmRecordRepo:            repository.AlarmRecord{},
		alarmRecordAcknowledgeRepo: repository.AlarmRecordAcknowledge{},
		deviceRepo:                 repository.Device{},
		userRepo:                   repository.User{},
	}
}

func (query AlarmRecordQuery) Paging(page, size int) ([]vo.AlarmRecord, int64, error) {
	ctx := context.TODO()
	es, total, err := query.alarmRecordRepo.PagingBySpecs(ctx, page, size, query.Specs...)
	if err != nil {
		return nil, 0, err
	}
	result := make([]vo.AlarmRecord, len(es))
	alertSources := map[uint]interface{}{}
	for i, e := range es {
		result[i] = vo.NewAlarmRecord(e)
		if _, ok := alertSources[e.SourceID]; !ok {
			if strings.HasPrefix(e.SourceType, entity.AlarmSourceTypeDevice) {
				if device, err := query.deviceRepo.Get(ctx, e.SourceID); err == nil {
					alertSources[e.SourceID] = vo.NewDevice(device)
				}
			}
		}
		result[i].Source = alertSources[e.SourceID]
	}
	return result, total, nil
}

func (query AlarmRecordQuery) GetAcknowledge(id uint) (*vo.AlarmRecordAcknowledge, error) {
	ctx := context.TODO()
	e, err := query.alarmRecordAcknowledgeRepo.GetBySpecs(ctx, spec.AlarmRecordEqSpec(id))
	if err != nil {
		return nil, err
	}
	result := vo.NewAlarmRecordAcknowledge(e)
	if user, err := query.userRepo.Get(ctx, e.UserID); err == nil {
		result.SetUser(user)
	}
	return &result, nil
}
