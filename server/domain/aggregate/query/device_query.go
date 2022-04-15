package query

import (
	"context"
	"fmt"
	"github.com/mitchellh/mapstructure"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"github.com/xuri/excelize/v2"
	"sort"
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
	alarmSourceRepo       dependency.AlarmSourceRepository
	largeSensorDataRepo   dependency.LargeSensorDataRepository
	eventRepo             dependency.EventRepository
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
		eventRepo:             repository.Event{},
		alarmSourceRepo:       repository.AlarmSource{},
		alarmRuleRepo:         repository.AlarmRule{},
	}
}

func (query DeviceQuery) check(id uint) (entity.Device, error) {
	ctx := context.TODO()
	query.Specs = append(query.Specs, spec.PrimaryKeyInSpec{id})
	device, err := query.deviceRepo.GetBySpecs(ctx, query.Specs...)
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
		result[i] = query.newDevice(device)
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
		result[i] = query.newDevice(device)
	}
	return result, nil
}

func (query DeviceQuery) Get(id uint) (*vo.Device, error) {
	device, err := query.check(id)
	if err != nil {
		return nil, err
	}
	result := query.newDevice(device)

	ctx := context.TODO()
	if network, err := query.networkRepo.Get(ctx, device.NetworkID); err == nil {
		result.SetNetwork(network)
	}

	if err != nil {
		xlog.Errorf("get device information failed:%v", device.MacAddress, err)
	}

	return &result, nil
}

func (query DeviceQuery) newDevice(device entity.Device) vo.Device {
	result := vo.NewDevice(device)
	result.SetUpgradeState(device)
	result.State, _ = query.deviceStateRepo.Get(device.MacAddress)
	result.Information, _ = query.deviceInformationRepo.Get(device.ID)
	if states, err := query.deviceAlertStateRepo.Find(device.MacAddress); err == nil {
		result.SetAlertStates(states)
	}
	if t := devicetype.Get(device.Type); t != nil {
		result.Properties = make(vo.Properties, 0)
		for _, property := range t.Properties(t.SensorID()) {
			result.Properties = append(result.Properties, vo.NewProperty(property))
		}
		sort.Sort(result.Properties)

		// set data
		if data, err := query.sensorDataRepo.Last(device.MacAddress, t.SensorID()); err == nil {
			deviceData := vo.NewDeviceData(data.Time)
			values := map[string]interface{}{}
			for _, property := range result.Properties {
				for _, field := range property.Fields {
					values[field.Key] = data.Values[field.Key]
				}
			}
			deviceData.Values = values
			result.Data = &deviceData
		}
	}
	return result
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

func (query DeviceQuery) FindDataByID(id uint, sensorType uint, from, to time.Time) ([]vo.DeviceData, error) {
	device, err := query.check(id)
	if err != nil {
		return nil, err
	}
	switch sensorType {
	case devicetype.KxSensor,
		devicetype.DynamicLengthAttitudeSensor,
		devicetype.DynamicSCL3300Sensor:
		return query.findRawData(device, from, to, sensorType)
	default:
		return query.findCharacteristicData(device, from, to)
	}
}

func (query DeviceQuery) findCharacteristicData(device entity.Device, from, to time.Time) ([]vo.DeviceData, error) {
	result := make([]vo.DeviceData, 0)
	if t := devicetype.Get(device.Type); t != nil {
		data, err := query.sensorDataRepo.Find(device.MacAddress, t.SensorID(), from, to)
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
			r := vo.NewDeviceData(data[i].Time)
			r.Values = properties
			result = append(result, r)
		}
	}
	return result, nil
}

func (query DeviceQuery) findRawData(device entity.Device, from, to time.Time, sensorType uint) ([]vo.DeviceData, error) {
	times, err := query.sensorDataRepo.FindTimes(device.MacAddress, sensorType, from, to)
	if err != nil {
		return nil, err
	}
	result := make(vo.DeviceDataList, len(times))
	for i, t := range times {
		result[i] = vo.NewDeviceData(t)
	}
	sort.Sort(result)
	return result, nil
}

func (query DeviceQuery) GetDataByIDAndTimestamp(id uint, sensorType uint, time time.Time, filters request.Filters) (*vo.DeviceData, error) {
	device, err := query.check(id)
	if err != nil {
		return nil, err
	}
	data, err := query.sensorDataRepo.Get(device.MacAddress, sensorType, time)
	if err != nil {
		return nil, err
	}
	result := vo.NewDeviceData(data.Time)
	switch sensorType {
	case devicetype.KxSensor:
		var e entity.SvtRawData
		if err := mapstructure.Decode(data.Values, &e); err != nil {
			return nil, err
		}
		axis := entity.AxisSensorData{}
		switch cast.ToInt(filters["dimension"]) {
		case 0:
			axis = e.XAxis
		case 1:
			axis = e.YAxis
		case 2:
			axis = e.ZAxis
		default:
			return nil, response.BusinessErr(errcode.DeviceDataInvalidError, "")
		}
		result.Values = getKxSensorData(axis, cast.ToString(filters["calculate"]))
	case devicetype.DynamicLengthAttitudeSensor:
		var e entity.SasRawData
		if err := mapstructure.Decode(data.Values, &e); err != nil {
			return nil, err
		}
		result.Values = e
	case devicetype.DynamicSCL3300Sensor:
		var e entity.SqRawData
		if err := mapstructure.Decode(data.Values, &e); err != nil {
			return nil, err
		}
		result.Values = e
	}
	return &result, nil
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

func (query DeviceQuery) DownloadCharacteristicData(id uint, pids []string, from, to time.Time, timezone string) (*vo.ExcelFile, error) {
	device, err := query.check(id)
	if err != nil {
		return nil, err
	}
	downloadKeys := make(map[string]struct{})
	for _, key := range pids {
		downloadKeys[key] = struct{}{}
	}
	result := vo.ExcelFile{
		Name: fmt.Sprintf("%s_%s_%s.xlsx", device.MacAddress, from.Format("20060102"), to.Format("20060102")),
		File: excelize.NewFile(),
	}
	if t := devicetype.Get(device.Type); t != nil {
		deviceData, err := query.FindDataByID(device.ID, t.SensorID(), from, to)
		if err != nil {
			return nil, err
		}
		// set cell title
		axis := 65
		_ = result.File.SetCellValue("Sheet1", "A1", "时间")
		for _, property := range t.Properties(t.SensorID()) {
			if _, ok := downloadKeys[property.Key]; ok {
				axis = axis + 1
				_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("%s1", string(rune(axis))), property.Name)
				_ = result.File.MergeCell("Sheet1", fmt.Sprintf("%s1", string(rune(axis))), fmt.Sprintf("%s1", string(rune(axis+len(property.Fields)-1))))
				if device.IsSVT() {
					for i, field := range property.Fields {
						_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("%s2", string(rune(axis+i))), field.Name)
					}
				}
				axis += len(property.Fields) - 1
			}
		}

		// set cell timezone
		location, err := time.LoadLocation(timezone)
		if err != nil {
			location, _ = time.LoadLocation("Local")
		}

		// set cell value
		cellOffset := 2
		if device.IsSVT() {
			cellOffset = 3
		}

		for i, data := range deviceData {
			axis = 65
			_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("A%d", i+cellOffset), time.Unix(data.Timestamp, 0).In(location).Format("2006-01-02 15:04:05"))
			if properties, ok := data.Values.(vo.Properties); ok {
				for _, property := range properties {
					if _, ok := downloadKeys[property.Key]; ok {
						for _, v := range property.Data {
							axis += 1
							_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(axis)), i+cellOffset), v)
						}
					}
				}
			}
		}
		return &result, nil
	}
	return nil, response.BusinessErr(errcode.UnknownDeviceTypeError, "")
}

func (query DeviceQuery) DownloadLargeSensorData(id uint, sensorType uint, time time.Time, filters request.Filters) (*vo.ExcelFile, error) {
	device, err := query.check(id)
	if err != nil {
		return nil, err
	}
	switch sensorType {
	case devicetype.KxSensor:
		return query.downloadKxSensorData(device, time, cast.ToString(filters["calculate"]))
	case devicetype.DynamicSCL3300Sensor:
		return query.downloadSqRawData(device, time)
	case devicetype.DynamicLengthAttitudeSensor:
		return query.downloadSasRawData(device, time)
	}
	return nil, response.BusinessErr(errcode.UnknownBusinessError, "")
}

func (query DeviceQuery) downloadSasRawData(device entity.Device, time time.Time) (*vo.ExcelFile, error) {
	data, err := query.sensorDataRepo.Get(device.MacAddress, devicetype.DynamicLengthAttitudeSensor, time)
	if err != nil {
		return nil, err
	}
	result := vo.ExcelFile{
		Name: fmt.Sprintf("%s_%s.xlsx", device.MacAddress, time.Format("20060102")),
		File: excelize.NewFile(),
	}
	col := 65
	var e entity.SasRawData
	if err := mapstructure.Decode(data.Values, &e); err != nil {
		return nil, err
	}
	_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(col)), 1), "dynamic length")
	_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(col+1)), 1), "dynamic preload")
	_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(col+2)), 1), "dynamic pressure")
	_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(col+3)), 1), "dynamic tof")
	for i := 0; i < len(e.DynamicLength); i++ {
		_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(col)), i+2), e.DynamicLength[i])
		_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(col+1)), i+2), e.DynamicPreload[i])
		_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(col+2)), i+2), e.DynamicPressure[i])
		_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(col+3)), i+2), e.DynamicTof[i])
	}
	return &result, nil
}

func (query DeviceQuery) downloadSqRawData(device entity.Device, time time.Time) (*vo.ExcelFile, error) {
	data, err := query.sensorDataRepo.Get(device.MacAddress, devicetype.DynamicSCL3300Sensor, time)
	if err != nil {
		return nil, err
	}
	result := vo.ExcelFile{
		Name: fmt.Sprintf("%s_%s.xlsx", device.MacAddress, time.Format("20060102")),
		File: excelize.NewFile(),
	}
	col := 65
	var e entity.SqRawData
	if err := mapstructure.Decode(data.Values, &e); err != nil {
		return nil, err
	}
	_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("%s1", string(rune(col))), "dynamic inclination")
	_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("%s1", string(rune(col+1))), "dynamic pitch")
	_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("%s1", string(rune(col+2))), "dynamic roll")
	for i := 0; i < len(e.DynamicInclination); i++ {
		_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(col)), i+2), e.DynamicInclination[i])
		_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(col+1)), i+2), e.DynamicPitch[i])
		_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(col+2)), i+2), e.DynamicRoll[i])
	}
	return &result, nil
}

func (query DeviceQuery) downloadKxSensorData(device entity.Device, time time.Time, calculate string) (*vo.ExcelFile, error) {
	data, err := query.sensorDataRepo.Get(device.MacAddress, devicetype.KxSensor, time)
	if err != nil {
		return nil, err
	}
	result := vo.ExcelFile{
		Name: fmt.Sprintf("%s_%s.xlsx", device.MacAddress, time.Format("20060102")),
		File: excelize.NewFile(),
	}
	col := 65
	for k, v := range data.Values {
		var e entity.AxisSensorData
		if err := mapstructure.Decode(v, &e); err != nil {
			return nil, err
		}
		_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("%s1", string(rune(col))), k)
		for i, value := range getKxSensorData(e, calculate).Values {
			_ = result.File.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(col)), i+2), value)
		}
		col += 1
	}
	return &result, nil
}

func getKxSensorData(value entity.AxisSensorData, calc string) vo.KxData {
	result := vo.NewKxData(value)
	switch calc {
	case "accelerationTimeDomain":
		domain := value.AccelerationTimeDomain()
		result.SetTimeDomainValues(domain)
		result.SetEnvelopeValues(value.Envelope(domain))
	case "accelerationFrequencyDomain":
		result.SetFrequencyDomainValues(value.AccelerationFrequencyDomain())
	case "velocityTimeDomain":
		domain := value.VelocityTimeDomain()
		result.SetTimeDomainValues(domain)
		result.SetEnvelopeValues(value.Envelope(domain))
	case "velocityFrequencyDomain":
		result.SetFrequencyDomainValues(value.VelocityFrequencyDomain())
	case "displacementTimeDomain":
		domain := value.DisplacementTimeDomain()
		result.SetTimeDomainValues(domain)
		result.SetEnvelopeValues(value.Envelope(domain))
	case "displacementFrequencyDomain":
		result.SetFrequencyDomainValues(value.DisplacementFrequencyDomain())
	}
	return result
}

func (query DeviceQuery) FindEventsByID(id uint, from, to int64) ([]vo.DeviceEvent, error) {
	device, err := query.check(id)
	if err != nil {
		return nil, err
	}
	es, err := query.eventRepo.FindBySpecs(context.TODO(), spec.SourceEqSpec(device.ID), spec.TimestampBetweenSpec{from, to})
	if err != nil {
		return nil, err
	}
	result := make(vo.DeviceEventList, len(es))
	for i, e := range es {
		result[i] = vo.NewDeviceEvent(e)
	}
	sort.Sort(result)
	return result, nil
}

func (query DeviceQuery) PagingEventsByID(id uint, from, to int64, page int, size int) ([]vo.DeviceEvent, int64, error) {
	device, err := query.check(id)
	if err != nil {
		return nil, 0, err
	}
	es, total, err := query.eventRepo.PagingBySpecs(context.TODO(), page, size, spec.SourceEqSpec(device.ID), spec.TimestampBetweenSpec{from, to})
	if err != nil {
		return nil, 0, err
	}
	result := make(vo.DeviceEventList, len(es))
	for i, e := range es {
		result[i] = vo.NewDeviceEvent(e)
	}
	return result, total, nil
}

func (query DeviceQuery) FindAlarmRulesByID(id uint) ([]vo.AlarmRule, error) {
	device, err := query.check(id)
	if err != nil {
		return nil, err
	}
	ctx := context.TODO()
	sources, err := query.alarmSourceRepo.FindBySpecs(ctx, spec.SourceEqSpec(device.ID))
	if err != nil {
		return nil, err
	}
	ruleIDs := make([]uint, len(sources))
	for i, source := range sources {
		ruleIDs[i] = source.AlarmRuleID
	}
	rules, err := query.alarmRuleRepo.FindBySpecs(ctx, spec.PrimaryKeyInSpec(ruleIDs), spec.SourceTypeEqSpec(device.Type), spec.CategoryEqSpec(uint(entity.AlarmRuleCategoryDevice)))
	if err != nil {
		return nil, err
	}
	result := make([]vo.AlarmRule, len(rules))
	for i, rule := range rules {
		result[i] = vo.NewAlarmRule(rule)
	}
	return result, nil
}
