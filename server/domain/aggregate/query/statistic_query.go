package query

import (
	"context"
	"fmt"
	"time"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
)

type StatisticQuery struct {
	Specs []spec.Specification

	deviceRepo           dependency.DeviceRepository
	deviceStateRepo      dependency.DeviceStateRepository
	deviceAlertStateRepo dependency.DeviceAlertStateRepository
	alarmRecordRepo      dependency.AlarmRecordRepository
	assetRepo            dependency.AssetRepository
	monitoringPointRepo  dependency.MonitoringPointRepository
}

func NewStatisticQuery() StatisticQuery {
	return StatisticQuery{
		deviceRepo:           repository.Device{},
		deviceStateRepo:      repository.DeviceState{},
		deviceAlertStateRepo: repository.DeviceAlertState{},
		alarmRecordRepo:      repository.AlarmRecord{},
		assetRepo:            repository.Asset{},
		monitoringPointRepo:  repository.MonitoringPoint{},
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
		r.IsOnline, _, _ = cache.GetConnection(device.MacAddress)
		if alertState, err := query.deviceAlertStateRepo.Find(device.MacAddress); err == nil {
			r.SetAlertState(alertState)
		}
		result[i] = r
	}

	return result, nil
}

func (query StatisticQuery) GetAlertStatistics() ([]vo.AlertStatistic, error) {
	devices, err := query.deviceRepo.FindBySpecs(context.TODO(), query.Specs...)
	if err != nil {
		return nil, err
	}
	sourceIDs := make([]uint, len(devices))
	for i, device := range devices {
		sourceIDs[i] = device.ID
	}
	now := time.Now()
	end, _ := time.Parse("2006-01-02", now.Format("2006-01-02"))
	begin, _ := time.Parse("2006-01-02", now.AddDate(0, 0, -7).Format("2006-01-02"))
	fmt.Println(end)
	alarmRecords, err := query.alarmRecordRepo.FindBySpecs(context.TODO(), spec.SourceInSpec(sourceIDs), spec.CreatedAtRangeSpec{begin, end})
	if err != nil {
		return nil, err
	}
	records := make(map[string][]entity.AlarmRecord, 0)
	for _, record := range alarmRecords {
		if record.Category == entity.AlarmRuleCategoryDevice {
			timeStr := record.CreatedAt.Format("2006-01-02")
			if _, ok := records[timeStr]; !ok {
				records[timeStr] = make([]entity.AlarmRecord, 0)
			}
			records[timeStr] = append(records[timeStr], record)
		}
	}
	result := make([]vo.AlertStatistic, 0)
	for i := 0; i < 7; i++ {
		date := begin.AddDate(0, 0, i)
		timeStr := date.Format("2006-01-02")
		r := vo.NewAlertStatistic(date)
		if record, ok := records[timeStr]; ok {
			r.Statistical(record)
		}
		result = append(result, r)
	}
	return result, nil
}

func (query StatisticQuery) GetAllStatistics() (vo.AllStatistics, error) {
	ctx := context.TODO()
	result := vo.AllStatistics{}

	sensorQuerySpecs := append(query.Specs, spec.TypeGtSpec(devicetype.RouterType))
	devices, err := query.deviceRepo.FindBySpecs(ctx, sensorQuerySpecs...)
	if err != nil {
		return result, err
	}

	result.DeviceNum = uint(len(devices))

	monitoringPoints, err := query.monitoringPointRepo.FindBySpecs(ctx, query.Specs...)
	if err != nil {
		return result, err
	}

	result.MonitoringPointNum = uint(len(monitoringPoints))

	rootAssetSpecs := append(query.Specs, spec.ParentIDEqSpec(0))
	rootAssets, err := query.assetRepo.FindBySpecs(ctx, rootAssetSpecs...)
	if err != nil {
		return result, err
	}

	result.RootAssetNum = uint(len(rootAssets))

	return result, nil
}
