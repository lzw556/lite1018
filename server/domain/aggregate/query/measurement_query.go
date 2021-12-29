package query

import (
	"context"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
	"time"
)

type MeasurementQuery struct {
	po.Measurement

	measurementDataRepo  dependency.MeasurementDataRepository
	measurementAlertRepo dependency.MeasurementAlertRepository
	largeSensorDataRepo  dependency.LargeSensorDataRepository
	alarmRecordRepo      dependency.AlarmRecordRepository
	assetRepo            dependency.AssetRepository
	bindingRepo          dependency.MeasurementDeviceBindingRepository
}

func NewMeasurementQuery() MeasurementQuery {
	return MeasurementQuery{
		measurementDataRepo:  repository.MeasurementData{},
		measurementAlertRepo: repository.MeasurementAlert{},
		largeSensorDataRepo:  repository.LargeSensorData{},
		alarmRecordRepo:      repository.AlarmRecord{},
		assetRepo:            repository.Asset{},
		bindingRepo:          repository.MeasurementDeviceBinding{},
	}
}

func (query MeasurementQuery) Run() *vo.Measurement {
	result := vo.NewMeasurement(query.Measurement)
	if alert, err := query.measurementAlertRepo.Get(query.Measurement.ID); err == nil {
		result.SetAlert(alert)
	}
	if data, err := query.measurementDataRepo.Last(query.Measurement.ID); err == nil {
		result.SetData(data)
	}
	if asset, err := query.assetRepo.Get(context.TODO(), query.Measurement.AssetID); err == nil {
		result.SetAsset(asset)
	}
	return &result
}

func (query MeasurementQuery) Statistical() (*vo.MeasurementStatistic, error) {
	result := vo.NewMeasurementStatistic(query.Measurement)
	total, err := query.measurementDataRepo.FindAll(query.Measurement.ID)
	ctx := context.TODO()
	if err != nil {
		return nil, err
	}
	date := time.Now().Format("2006-01-02")
	begin, _ := time.Parse("2006-01-02 15:04:05", fmt.Sprintf("%s 00:00:00", date))
	end, _ := time.Parse("2006-01-02 15:04:05", fmt.Sprintf("%s 23:59:59", date))
	result.Data.Total = len(total)
	for _, data := range total {
		if data.Time.Format("2006-01-02") == date {
			result.Data.Today = result.Data.Today + 1
		}
	}
	if total, err := query.alarmRecordRepo.CountBySpecs(ctx, spec.MeasurementEqSpec(query.Measurement.ID)); err == nil {
		result.Alert.Total = int(total)
	}
	if untreated, err := query.alarmRecordRepo.CountBySpecs(ctx, spec.MeasurementEqSpec(query.Measurement.ID), spec.StatusInSpec{uint(po.AlarmRecordStatusUntreated)}); err == nil {
		result.Alert.Untreated = int(untreated)
	}
	if today, err := query.alarmRecordRepo.CountBySpecs(ctx, spec.MeasurementEqSpec(query.Measurement.ID), spec.StatusInSpec{uint(po.AlarmRecordStatusUntreated)}, spec.CreatedAtRangeSpec{begin, end}); err == nil {
		result.Alert.Today = int(today)
	}
	return &result, nil
}

func (query MeasurementQuery) GetData(from, to int64) ([]vo.MeasurementData, error) {
	start := time.Unix(from, 0)
	end := time.Unix(to, 0)
	data, err := query.measurementDataRepo.Find(query.Measurement.ID, start, end)
	if err != nil {
		return nil, err
	}
	result := make([]vo.MeasurementData, len(data))
	for i, d := range data {
		result[i] = vo.NewMeasurementData(d)
		for k, v := range d.Fields {
			if variable, err := measurementtype.GetVariable(query.Measurement.Type, k); err == nil {
				result[i].Fields = append(result[i].Fields, vo.MeasurementField{
					Variable: variable,
					Value:    v,
				})
			}
		}
	}
	return result, nil
}

func (query MeasurementQuery) GetRawData(from, to int64) ([]vo.MeasurementRawData, error) {
	ctx := context.TODO()
	binding, err := query.bindingRepo.GetBySpecs(ctx, spec.MeasurementEqSpec(query.Measurement.ID))
	if err != nil {
		return nil, err
	}
	data, err := query.largeSensorDataRepo.Find(binding.MacAddress, time.Unix(from, 0), time.Unix(to, 0))
	if err != nil {
		return nil, err
	}
	result := make([]vo.MeasurementRawData, len(data))
	for i, d := range data {
		result[i] = vo.NewMeasurementRawData(d)
	}
	return result, nil
}
