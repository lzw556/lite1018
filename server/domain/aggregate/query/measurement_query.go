package query

import (
	"context"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/calculate"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/measurementtype"
	"sort"
	"sync"
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
		bindingRepo:          repository.MeasurementDeviceBinding{},
		assetRepo:            repository.Asset{},
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

func (query MeasurementQuery) GetData(from, to int64) ([]vo.MeasurementData, error) {
	start := time.Unix(from, 0)
	end := time.Unix(to, 0)
	data, err := query.measurementDataRepo.Find(query.Measurement.ID, start, end)
	if err != nil {
		return nil, err
	}
	result := make([]vo.MeasurementData, len(data))
	variables := measurementtype.Get(query.Measurement.Type).Variables()
	for i, d := range data {
		result[i] = vo.NewMeasurementData(d)
		for k, v := range d.Fields {
			if variable, err := variables.GetByName(k); err == nil {
				result[i].Fields = append(result[i].Fields, vo.MeasurementField{
					Variable: variable,
					Value:    v,
				})
			}
		}
	}
	return result, nil
}

func (query MeasurementQuery) GateRawDataByRange(from, to int64) (vo.MeasurementsRawData, error) {
	ctx := context.TODO()
	binding, err := query.bindingRepo.GetBySpecs(ctx, spec.MeasurementEqSpec(query.Measurement.ID))
	if err != nil {
		return nil, err
	}
	data, err := query.largeSensorDataRepo.Find(binding.MacAddress, time.Unix(from, 0), time.Unix(to, 0))
	if err != nil {
		return nil, err
	}
	result := make(vo.MeasurementsRawData, len(data))
	for i, d := range data {
		result[i] = vo.NewWaveData(d)
	}
	sort.Sort(result)
	return result, nil
}

func (query MeasurementQuery) GateWaveData(timestamp int64, calc string) (*vo.WaveData, error) {
	ctx := context.TODO()
	binding, err := query.bindingRepo.GetBySpecs(ctx, spec.MeasurementEqSpec(query.Measurement.ID))
	if err != nil {
		return nil, err
	}
	data, err := query.largeSensorDataRepo.Get(binding.MacAddress, time.Unix(timestamp, 0))
	if err != nil {
		return nil, err
	}
	result := vo.NewWaveData(data)
	result.SetValues(data.Values)
	frequency := cast.ToInt(data.Parameters["kx122_continuous_odr"])
	if frequency == 0 {
		frequency = 12.8 * 1000
	}
	unitG := cast.ToInt(data.Parameters["kx122_continuous_range"])
	if unitG == 0 {
		unitG = 8
	}
	var wg sync.WaitGroup
	for i, values := range result.Values {
		wg.Add(1)
		go func(i int, values []float64) {
			defer wg.Done()
			switch calc {
			case "accelerationFrequencyDomain":
				accelerationFFT := calculate.AccelerationFrequencyCalc(values, len(values), frequency, unitG)
				frequencies := make([]int, len(accelerationFFT))
				for j, output := range accelerationFFT {
					result.Values[i][j] = output.FFTValue
					frequencies[j] = int(output.Frequency)
				}
				result.Frequencies = append(result.Frequencies, frequencies)
			case "velocityTimeDomain":
				result.Values[i] = calculate.VelocityCalc(values, len(values), frequency, unitG)
				times := make([]int, len(result.Values[i]))
				for j := range times {
					times[j] = int((float32(j+1) / float32(frequency)) * 1000)
				}
				result.Times = append(result.Times, times)
			case "velocityFrequencyDomain":
				velocityFFT := calculate.VelocityFrequencyCalc(values, len(values), frequency, unitG)
				frequencies := make([]int, len(velocityFFT))
				for j, output := range velocityFFT {
					result.Values[i][j] = output.FFTValue
					frequencies[j] = int(output.Frequency)
				}
				result.Frequencies = append(result.Frequencies, frequencies)
			case "displacementTimeDomain":
				result.Values[i] = calculate.DisplacementCalc(values, len(values), frequency, unitG)
				times := make([]int, len(result.Values[i]))
				for j := range times {
					times[j] = int((float32(j+1) / float32(frequency)) * 1000)
				}
				result.Times = append(result.Times, times)
			case "displacementFrequencyDomain":
				displacementFFT := calculate.DisplacementFrequencyCalc(values, len(values), frequency, unitG)
				frequencies := make([]int, len(displacementFFT))
				for j, output := range displacementFFT {
					result.Values[i][j] = output.FFTValue
					frequencies[j] = int(output.Frequency)
				}
				result.Frequencies = append(result.Frequencies, frequencies)
			default:
				result.Values[i] = calculate.AccelerationCalc(values, len(values), frequency, unitG)
				times := make([]int, len(result.Values[i]))
				for j := range times {
					times[j] = int((float32(j+1) / float32(frequency)) * 1000)
				}
				result.Times = append(result.Times, times)
			}
		}(i, values)
	}
	wg.Wait()
	return &result, nil
}
