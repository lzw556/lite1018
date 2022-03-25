package query

import (
	"context"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"time"
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

func (query AlarmRecordQuery) Get(id uint) (*vo.AlarmRecord, error) {
	e, err := query.alarmRecordRepo.Get(context.TODO(), id)
	if err != nil {
		return nil, err
	}
	result := vo.NewAlarmRecord(e)
	return &result, nil
}

func (query AlarmRecordQuery) Paging(page, size int, from, to time.Time) ([]vo.AlarmRecord, int64, error) {
	ctx := context.TODO()
	query.Specs = append(query.Specs, spec.CreatedAtRangeSpec{from, to})
	fmt.Println(query.Specs)
	es, total, err := query.alarmRecordRepo.PagingBySpecs(ctx, page, size, query.Specs...)
	if err != nil {
		return nil, 0, err
	}
	result := make([]vo.AlarmRecord, len(es))
	alertSources := map[uint]interface{}{}
	for i, e := range es {
		result[i] = vo.NewAlarmRecord(e)
		if _, ok := alertSources[e.SourceID]; !ok {
			if e.Category == entity.AlarmRuleCategoryDevice {
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
