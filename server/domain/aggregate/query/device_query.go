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
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
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
		data, err := query.sensorDataRepo.Last(device.MacAddress, t.SensorID())
		if err != nil {
			return nil, err
		}
		result.Properties = make(vo.Properties, 0)
		deviceData := vo.NewDeviceData(data.Time)
		values := map[string]interface{}{}
		for _, p := range t.Properties(t.SensorID()) {
			property := vo.NewProperty(p)
			if len(data.Values) > 0 {
				for _, field := range p.Fields {
					values[field.Key] = data.Values[field.Key]
				}
			}
			result.Properties = append(result.Properties, property)
			result.SetDataTypes(t.SensorID())
		}
		deviceData.Values = values
		result.Data = &deviceData
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

func (query DeviceQuery) PagingDataByID(id uint, sensorType uint, page, size int, from, to int64) ([]vo.DeviceData, int64, error) {
	device, err := query.check(id)
	if err != nil {
		return nil, 0, err
	}
	data, total, err := query.sensorDataRepo.Paging(device.MacAddress, sensorType, time.Unix(from, 0), time.Unix(to, 0), page, size)
	if err != nil {
		return nil, 0, err
	}
	result := make(vo.DeviceDataList, len(data))
	for i, d := range data {
		result[i] = vo.NewDeviceData(d.Time)
	}
	sort.Sort(result)
	return result, total, nil
}

func (query DeviceQuery) FindDataByID(id uint, sensorType uint, from, to time.Time) ([]vo.DeviceData, error) {
	device, err := query.check(id)
	if err != nil {
		return nil, err
	}
	result := make([]vo.DeviceData, 0)
	if t := devicetype.Get(device.Type); t != nil {
		if sensorType == 0 {
			sensorType = t.SensorID()
		}
		data, err := query.sensorDataRepo.Find(device.MacAddress, sensorType, from, to)
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
		axis := "x"
		switch cast.ToInt(filters["dimension"]) {
		case 0:
			axis = "x"
		case 1:
			axis = "y"
		case 2:
			axis = "z"
		}
		var e entity.AxisSensorData
		if err := mapstructure.Decode(data.Values[axis], &e); err != nil {
			return nil, err
		}
		result.Values = getKxSensorData(e, cast.ToString(filters["calculate"]))
	}
	return &result, nil
}

func (query DeviceQuery) RuntimeDataByRange(id uint, from, to time.Time) ([]vo.SensorRuntimeData, error) {
	device, err := query.check(id)
	if err != nil {
		return nil, err
	}

	data, err := query.deviceStateRepo.Find(device.MacAddress, from, to)
	fmt.Println(data)
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

func (query DeviceQuery) DownloadCharacteristicData(id uint, pids []string, from, to time.Time) (*vo.ExcelFile, error) {
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

		// set cell value
		for i, data := range deviceData {
			axis := 65
			result.File.SetCellValue("Sheet1", fmt.Sprintf("A%d", i+3), time.Unix(data.Timestamp, 0).Format("2006-01-02 15:04:05"))
			if properties, ok := data.Values.(vo.Properties); ok {
				for _, property := range properties {
					if _, ok := downloadKeys[property.Key]; ok {
						for _, v := range property.Data {
							fmt.Println(property.Data)
							axis += 1
							result.File.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(axis)), i+3), v)
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
	}
	return nil, response.BusinessErr(errcode.UnknownBusinessError, "")
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
	col := 66
	for k, v := range data.Values {
		var e entity.AxisSensorData
		if err := mapstructure.Decode(v, &e); err != nil {
			return nil, err
		}
		result.File.SetCellValue("Sheet1", fmt.Sprintf("%s1", string(rune(col))), k)
		for i, value := range getKxSensorData(e, calculate).Values {
			result.File.SetCellValue("Sheet1", fmt.Sprintf("%s%d", string(rune(col)), i+1), value)
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

func (query DeviceQuery) GetWaveDataByTimestamp(id uint, timestamp int64, calc string, dimension int) (*vo.KxData, error) {
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
	axis := []entity.AxisSensorData{svtRawData.XAxis, svtRawData.YAxis, svtRawData.ZAxis}[dimension]
	result := vo.NewKxData(axis)
	switch calc {
	case "accelerationTimeDomain":
		result.SetTimeDomainValues(axis.AccelerationTimeDomain())
		result.SetEnvelopeValues(axis.Envelope(axis.AccelerationTimeDomain()))
	case "accelerationFrequencyDomain":
		result.SetFrequencyDomainValues(axis.AccelerationFrequencyDomain())
	case "velocityTimeDomain":
		result.SetTimeDomainValues(axis.VelocityTimeDomain())
		result.SetEnvelopeValues(axis.Envelope(axis.VelocityTimeDomain()))
	case "velocityFrequencyDomain":
		result.SetFrequencyDomainValues(axis.VelocityFrequencyDomain())
	case "displacementTimeDomain":
		result.SetTimeDomainValues(axis.DisplacementTimeDomain())
		result.SetEnvelopeValues(axis.Envelope(axis.DisplacementTimeDomain()))
	case "displacementFrequencyDomain":
		result.SetFrequencyDomainValues(axis.DisplacementFrequencyDomain())
	}
	return &result, nil
}
