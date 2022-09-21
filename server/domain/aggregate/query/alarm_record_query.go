package query

import (
	"context"
	"time"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type AlarmRecordQuery struct {
	Specs []spec.Specification

	alarmRecordRepo            dependency.AlarmRecordRepository
	alarmRecordAcknowledgeRepo dependency.AlarmRecordAcknowledgeRepository
	deviceRepo                 dependency.DeviceRepository
	monitoringPointRepo        dependency.MonitoringPointRepository
	userRepo                   dependency.UserRepository
	alarmRuleGroupRepo         dependency.AlarmRuleGroupRepository
}

func NewAlarmRecordQuery() AlarmRecordQuery {
	return AlarmRecordQuery{
		alarmRecordRepo:            repository.AlarmRecord{},
		alarmRecordAcknowledgeRepo: repository.AlarmRecordAcknowledge{},
		deviceRepo:                 repository.Device{},
		monitoringPointRepo:        repository.MonitoringPoint{},
		userRepo:                   repository.User{},
		alarmRuleGroupRepo:         repository.AlarmRuleGroup{},
	}
}

func (query AlarmRecordQuery) Get(id uint) (*vo.AlarmRecord, error) {
	e, err := query.alarmRecordRepo.Get(context.TODO(), id)
	if err != nil {
		return nil, err
	}
	result := vo.NewAlarmRecord(e)
	if g, err := query.alarmRuleGroupRepo.Get(context.TODO(), result.AlarmRuleGroupID); err == nil {
		result.AlarmRuleGroupName = g.Name
	}
	return &result, nil
}

func (query AlarmRecordQuery) Paging(page, size int, from, to time.Time) ([]vo.AlarmRecord, int64, error) {
	ctx := context.TODO()
	query.Specs = append(query.Specs, spec.CreatedAtRangeSpec{from, to})
	es, total, err := query.alarmRecordRepo.PagingBySpecs(ctx, page, size, query.Specs...)
	if err != nil {
		return nil, 0, err
	}
	result := make([]vo.AlarmRecord, len(es))
	alertSources := map[uint]interface{}{}
	for i, e := range es {
		if e.Category == entity.AlarmRuleCategoryMonitoringPoint {
			result[i] = vo.NewAlarmRecord(e)
			if g, err := query.alarmRuleGroupRepo.Get(context.TODO(), result[i].AlarmRuleGroupID); err == nil {
				result[i].AlarmRuleGroupName = g.Name
			} else {
				result[i].AlarmRuleGroupID = 0
			}
			if _, ok := alertSources[e.SourceID]; !ok {
				if mp, err := query.monitoringPointRepo.Get(ctx, e.SourceID); err == nil {
					q := NewMonitoringPointQuery()
					if voMp, err := q.Get(mp.ID); err == nil {
						alertSources[e.SourceID] = voMp
					}
				}
			}
			result[i].Source = alertSources[e.SourceID]
		}
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
