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
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
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
	deviceRepo           dependency.DeviceRepository
}

func NewMeasurementQuery() MeasurementQuery {
	return MeasurementQuery{
		measurementDataRepo:  repository.MeasurementData{},
		measurementAlertRepo: repository.MeasurementAlert{},
		largeSensorDataRepo:  repository.LargeSensorData{},
		alarmRecordRepo:      repository.AlarmRecord{},
		bindingRepo:          repository.MeasurementDeviceBinding{},
		assetRepo:            repository.Asset{},
		deviceRepo:           repository.Device{},
	}
}

func (query MeasurementQuery) GetDetail() *vo.Measurement {
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

func (query MeasurementQuery) GetSettings() (*vo.MeasurementSettings, error) {
	ctx := context.TODO()
	binding, err := query.bindingRepo.GetBySpecs(ctx, spec.MeasurementEqSpec(query.Measurement.ID))
	if err != nil {
		return nil, err
	}
	device, err := query.deviceRepo.GetBySpecs(ctx, spec.DeviceMacEqSpec(binding.MacAddress))
	if err != nil {
		return nil, err
	}
	t := devicetype.Get(device.Type)
	if t == nil {
		return nil, nil
	}
	result := vo.MeasurementSettings{}
	result.Settings = query.Settings
	settings := t.Settings()
	for i, setting := range t.Settings() {
		if s, ok := query.SensorSettings.Get(setting.Key); ok {
			settings[i].Value = setting.Convert(s.Value)
		} else {
			settings[i].Value = setting.Convert(setting.Value)
		}
	}
	result.SensorSettings = vo.NewDeviceSettings(settings)
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

func (query MeasurementQuery) GetWaveData(timestamp int64, calc string) (*vo.WaveData, error) {
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
	values := make([][]float64, 3)
	for i := 0; i < len(data.Values); i++ {
		values[i%len(values)] = append(values[i%len(values)], data.Values[i])
	}
	if result.Frequency == 0 {
		result.Frequency = 12.8 * 1000
	}
	unitG := cast.ToInt(data.Parameters["kx122_continuous_range"])
	if unitG == 0 {
		unitG = 8
	}
	var wg sync.WaitGroup
	result.Values = make([][]float64, len(values))
	result.Frequencies = make([][]int, len(values))
	result.Times = make([][]int, len(values))
	result.HighEnvelopes = make([][]float64, len(values))
	result.LowEnvelopes = make([][]float64, len(values))
	for i := range values {
		wg.Add(1)
		go func(m int) {
			defer wg.Done()
			switch calc {
			case "accelerationTimeDomain":
				accelerationValues := calculate.AccelerationCalc(values[m], len(values[m]), int(result.Frequency), unitG)
				result.SetTimeDomainValues(m, accelerationValues)
			case "accelerationFrequencyDomain":
				fftValues, fftFrequencies := calculate.AccelerationFrequencyCalc(values[m], len(values[m]), int(result.Frequency), unitG)
				result.SetFrequencyDomainValues(m, fftValues, fftFrequencies)
			case "accelerationEnvelope":
				accelerationValues := calculate.AccelerationCalc(values[m], len(values[m]), int(result.Frequency), unitG)
				highEnvelope, lowEnvelope := calculate.EnvelopCalc(accelerationValues)
				result.SetTimeDomainValues(m, accelerationValues)
				result.SetEnvelopeValues(m, highEnvelope, lowEnvelope)
			case "velocityTimeDomain":
				velocityValues := calculate.VelocityCalc(values[m], len(values[m]), int(result.Frequency), unitG)
				result.SetTimeDomainValues(m, velocityValues)
			case "velocityFrequencyDomain":
				fftValues, fftFrequencies := calculate.VelocityFrequencyCalc(values[m], len(values[m]), int(result.Frequency), unitG)
				result.SetFrequencyDomainValues(m, fftValues, fftFrequencies)
			case "velocityEnvelope":
				velocityValues := calculate.VelocityCalc(values[m], len(values[m]), int(result.Frequency), unitG)
				highEnvelope, lowEnvelope := calculate.EnvelopCalc(velocityValues)
				result.SetTimeDomainValues(m, velocityValues)
				result.SetEnvelopeValues(m, highEnvelope, lowEnvelope)
			case "displacementTimeDomain":
				displacementValues := calculate.DisplacementCalc(values[m], len(values[m]), int(result.Frequency), unitG)
				result.SetTimeDomainValues(m, displacementValues)
			case "displacementFrequencyDomain":
				fftValues, fftFrequencies := calculate.DisplacementFrequencyCalc(values[m], len(values[m]), int(result.Frequency), unitG)
				result.SetFrequencyDomainValues(m, fftValues, fftFrequencies)
			case "displacementEnvelope":
				displacementValues := calculate.DisplacementCalc(values[m], len(values[m]), int(result.Frequency), unitG)
				highEnvelope, lowEnvelope := calculate.EnvelopCalc(displacementValues)
				result.SetTimeDomainValues(m, displacementValues)
				result.SetEnvelopeValues(m, highEnvelope, lowEnvelope)
			}
		}(i)
	}
	wg.Wait()
	return &result, nil
}
