package query

import (
	"context"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"github.com/xuri/excelize/v2"
	"sort"
	"sync"
	"time"
)

type DeviceQuery struct {
	Specs []spec.Specification

	deviceRepo            dependency.DeviceRepository
	deviceStateRepo       dependency.DeviceStateRepository
	sensorDataRepo        dependency.SensorDataRepository
	deviceInformationRepo dependency.DeviceInformationRepository
	deviceAlertStateRepo  dependency.DeviceAlertStateRepository
	networkRepo           dependency.NetworkRepository
	alarmRuleRepo         dependency.AlarmRuleRepository
	largeSensorDataRepo   dependency.LargeSensorDataRepository
}

func NewDeviceQuery() DeviceQuery {
	return DeviceQuery{
		deviceRepo:            repository.Device{},
		deviceStateRepo:       repository.DeviceState{},
		sensorDataRepo:        repository.SensorData{},
		deviceInformationRepo: repository.DeviceInformation{},
		deviceAlertStateRepo:  repository.DeviceAlertState{},
		networkRepo:           repository.Network{},
		largeSensorDataRepo:   repository.LargeSensorData{},
	}
}

func (query DeviceQuery) check(id uint) (entity.Device, error) {
	ctx := context.TODO()
	device, err := query.deviceRepo.Get(ctx, id)
	if err != nil {
		return entity.Device{}, response.BusinessErr(errcode.DeviceNotFoundError, err.Error())
	}
	return device, nil
}

func (query DeviceQuery) Paging(page, size int) ([]vo.Device, int64, error) {
	ctx := context.TODO()
	es, total, err := query.deviceRepo.PagingBySpecs(ctx, page, size, query.Specs...)
	if err != nil {
		return nil, 0, err
	}
	result := make([]vo.Device, len(es))
	for i, device := range es {
		result[i] = vo.NewDevice(device)
		result[i].SetUpgradeState(device)
		result[i].State, _ = query.deviceStateRepo.Get(device.MacAddress)
		if states, err := query.deviceAlertStateRepo.Find(device.MacAddress); err == nil {
			result[i].SetAlertStates(states)
		}
	}
	return result, total, nil
}

func (query DeviceQuery) List() ([]vo.Device, error) {
	ctx := context.TODO()
	es, err := query.deviceRepo.FindBySpecs(ctx, query.Specs...)
	if err != nil {
		return nil, err
	}
	result := make([]vo.Device, len(es))
	for i, device := range es {
		result[i] = vo.NewDevice(device)
		result[i].SetUpgradeState(device)
		result[i].State, _ = query.deviceStateRepo.Get(device.MacAddress)
	}
	return result, nil
}

func (query DeviceQuery) Get(id uint) (*vo.Device, error) {
	device, err := query.check(id)
	if err != nil {
		return nil, err
	}
	result := vo.NewDevice(device)

	ctx := context.TODO()
	if network, err := query.networkRepo.Get(ctx, device.NetworkID); err == nil {
		result.SetNetwork(network)
	}

	if t := devicetype.Get(device.Type); t != nil {
		data, err := query.sensorDataRepo.Last(device.MacAddress)
		if err != nil {
			return nil, err
		}
		result.Properties = make(vo.Properties, 0)
		for _, p := range t.Properties(t.SensorID()) {
			property := vo.NewProperty(p)
			if len(data.Values) > 0 {
				for _, field := range p.Fields {
					property.SetData(field.Name, data.Values[field.Key])
				}
			}
			result.Properties = append(result.Properties, property)
		}
		sort.Sort(result.Properties)
	}

	result.State, _ = query.deviceStateRepo.Get(device.MacAddress)
	result.Information, err = query.deviceInformationRepo.Get(device.ID)
	if err != nil {
		xlog.Errorf("get device information failed:%v", device.MacAddress, err)
	}

	return &result, nil
}

func (query DeviceQuery) GetSettings(id uint) (vo.DeviceSettings, error) {
	device, err := query.check(id)
	if err != nil {
		return nil, err
	}

	if t := devicetype.Get(device.Type); t != nil {
		settings := t.Settings()
		for i, setting := range t.Settings() {
			if s, ok := device.Settings.Get(setting.Key); ok {
				settings[i].Value = setting.Convert(s.Value)
			} else {
				settings[i].Value = setting.Convert(setting.Value)
			}
		}
		result := vo.NewDeviceSettings(settings)
		return result, nil
	}

	return nil, response.BusinessErr(errcode.UnknownDeviceTypeError, "")
}

func (query DeviceQuery) FindDataByRange(id uint, from, to time.Time) ([]vo.DeviceData, error) {
	device, err := query.check(id)
	if err != nil {
		return nil, err
	}
	result := make([]vo.DeviceData, 0)
	if t := devicetype.Get(device.Type); t != nil {
		data, err := query.sensorDataRepo.Find(device.MacAddress, from, to)
		if err != nil {
			return nil, err
		}
		for i := range data {
			properties := make(vo.Properties, 0)
			for _, p := range t.Properties(t.SensorID()) {
				property := vo.NewProperty(p)
				for _, field := range p.Fields {
					property.SetData(field.Name, data[i].Values[field.Key])
				}
				properties = append(properties, property)
			}
			result = append(result, vo.NewDeviceData(data[i].Time, properties))
		}
	}
	return result, nil
}

func (query DeviceQuery) GetLastData(id uint) (*vo.DeviceData, error) {
	device, err := query.check(id)
	if err != nil {
		return nil, err
	}
	if t := devicetype.Get(device.Type); t != nil {
		data, err := query.sensorDataRepo.Last(device.MacAddress)
		if err != nil {
			return nil, err
		}
		properties := make(vo.Properties, 0)
		for _, p := range t.Properties(t.SensorID()) {
			property := vo.NewProperty(p)
			for _, field := range p.Fields {
				property.SetData(field.Name, data.Values[field.Key])
			}
			properties = append(properties, property)
		}
		result := vo.NewDeviceData(data.Time, properties)
		return &result, nil
	}
	return nil, response.BusinessErr(errcode.UnknownDeviceTypeError, "")
}

func (query DeviceQuery) RuntimeDataByRange(id uint, from, to time.Time) ([]vo.SensorRuntimeData, error) {
	device, err := query.check(id)
	if err != nil {
		return nil, err
	}

	data, err := query.deviceStateRepo.Find(device.MacAddress, from, to)
	if err != nil {
		return nil, err
	}
	result := make([]vo.SensorRuntimeData, len(data))
	for i, d := range data {
		result[i] = vo.SensorRuntimeData{
			Timestamp:      d.ConnectedAt,
			BatteryVoltage: d.BatteryVoltage,
			SignalStrength: d.SignalLevel,
		}
	}
	return result, nil
}

func (query DeviceQuery) DownloadDeviceDataByRange(id uint, pIDs []string, from time.Time, to time.Time) (*vo.ExcelFile, error) {
	device, err := query.check(id)
	if err != nil {
		return nil, err
	}
	downloadKeys := make(map[string]struct{})
	for _, key := range pIDs {
		downloadKeys[key] = struct{}{}
	}
	deviceData, err := query.FindDataByRange(id, from, to)
	if err != nil {
		return nil, err
	}
	result := vo.ExcelFile{
		Name: fmt.Sprintf("%s_%s_%s.xlsx", device.MacAddress, from.Format("20060102"), to.Format("20060102")),
		File: excelize.NewFile(),
	}
	if t := devicetype.Get(device.Type); t != nil {
		// set cell title
		axis := 65
		result.File.SetCellValue("Sheet1", "A1", "时间")
		for _, property := range t.Properties(t.SensorID()) {
			if _, ok := downloadKeys[property.Key]; ok {
				axis = axis + 1
				result.File.SetCellValue("Sheet1", fmt.Sprintf("%s1", string(rune(axis))), property.Name)
				result.File.MergeCell("Sheet1", fmt.Sprintf("%s1", string(rune(axis))), fmt.Sprintf("%s1", string(rune(axis+len(property.Fields)-1))))
				for i, field := range property.Fields {
					result.File.SetCellValue("Sheet1", fmt.Sprintf("%s2", string(rune(axis+i))), field.Name)
				}
				axis += len(property.Fields) - 1
			}
		}
	}

	// set cell value
	for i, data := range deviceData {
		axis := 65
		result.File.SetCellValue("Sheet1", fmt.Sprintf("A%d", i+3), time.Unix(data.Timestamp, 0).Format("2006-01-02 15:04:05"))
		for _, property := range data.Properties {
			if _, ok := downloadKeys[property.Key]; ok {
				for _, v := range property.Data {
					axis += 1
					result.File.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(axis)), i+3), v)
				}
			}
		}
	}
	return &result, nil
}

func (query DeviceQuery) FindWaveDataByRange(id uint, from time.Time, to time.Time) (vo.LargeSensorDataList, error) {
	device, err := query.check(id)
	if err != nil {
		return nil, err
	}
	es, err := query.largeSensorDataRepo.Find(device.MacAddress, from, to)
	if err != nil {
		return nil, err
	}
	result := make(vo.LargeSensorDataList, len(es))
	for i, e := range es {
		result[i] = vo.NewLargeSensorData(e)
	}
	sort.Sort(result)
	return result, nil
}

func (query DeviceQuery) GetWaveDataByTimestamp(id uint, timestamp int64, calc string) ([]vo.WaveData, error) {
	device, err := query.check(id)
	if err != nil {
		return nil, err
	}

	data, err := query.largeSensorDataRepo.Get(device.MacAddress, time.Unix(timestamp, 0))
	if err != nil {
		return nil, err
	}
	var svtRawData entity.SvtRawData
	if err := json.Unmarshal(data.Data, &svtRawData); err != nil {
		return nil, err
	}
	axisData := []entity.AxisSensorData{svtRawData.XAxis, svtRawData.YAxis, svtRawData.ZAxis}
	result := make([]vo.WaveData, 3)
	var wg sync.WaitGroup
	for i := range axisData {
		wg.Add(1)
		go func(m int) {
			axis := axisData[m]
			r := vo.NewWaveData(axis)
			defer wg.Done()
			switch calc {
			case "accelerationTimeDomain":
				r.SetTimeDomainValues(axis.AccelerationTimeDomain())
				r.SetEnvelopeValues(axis.Envelope(axis.AccelerationTimeDomain()))
			case "accelerationFrequencyDomain":
				r.SetFrequencyDomainValues(axis.AccelerationFrequencyDomain())
			case "velocityTimeDomain":
				r.SetTimeDomainValues(axis.VelocityTimeDomain())
				r.SetEnvelopeValues(axis.Envelope(axis.VelocityTimeDomain()))
			case "velocityFrequencyDomain":
				r.SetFrequencyDomainValues(axis.VelocityFrequencyDomain())
			case "displacementTimeDomain":
				r.SetTimeDomainValues(axis.DisplacementTimeDomain())
				r.SetEnvelopeValues(axis.Envelope(axis.DisplacementTimeDomain()))
			case "displacementFrequencyDomain":
				r.SetFrequencyDomainValues(axis.DisplacementFrequencyDomain())
			}
			result[m] = r
		}(i)
	}
	wg.Wait()
	return result, nil
}
