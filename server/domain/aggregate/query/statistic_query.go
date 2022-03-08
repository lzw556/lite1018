package query

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type StatisticQuery struct {
	Specs []spec.Specification

	deviceRepo           dependency.DeviceRepository
	deviceStateRepo      dependency.DeviceStateRepository
	deviceAlertStateRepo dependency.DeviceAlertStateRepository
}

func NewStatisticQuery() StatisticQuery {
	return StatisticQuery{
		deviceRepo:           repository.Device{},
		deviceStateRepo:      repository.DeviceState{},
		deviceAlertStateRepo: repository.DeviceAlertState{},
	}
}

func (query StatisticQuery) GetDeviceStatistics() ([]vo.DeviceStatistic, error) {
	ctx := context.TODO()
	devices, err := query.deviceRepo.FindBySpecs(ctx, query.Specs...)
	if err != nil {
		return nil, err
	}

	result := make([]vo.DeviceStatistic, len(devices))
	for i, device := range devices {
		r := vo.DeviceStatistic{}
		if state, err := query.deviceStateRepo.Get(device.MacAddress); err == nil {
			r.IsOnline = state.IsOnline
		}
		if alertState, err := query.deviceAlertStateRepo.Find(device.MacAddress); err == nil {
			r.SetAlertState(alertState)
		}
		result[i] = r
	}

	return result, nil
}
