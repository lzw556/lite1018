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
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"github.com/xuri/excelize/v2"
	"time"
)

type DeviceQuery struct {
	entity.Device

	deviceRepo            dependency.DeviceRepository
	deviceStatusRepo      dependency.DeviceStatusRepository
	deviceDataRepo        dependency.SensorDataRepository
	deviceInformationRepo dependency.DeviceInformationRepository
	networkRepo           dependency.NetworkRepository
	alarmRuleRepo         dependency.AlarmRepository
	bindingRepo           dependency.MeasurementDeviceBindingRepository
}

func NewDeviceQuery() DeviceQuery {
	return DeviceQuery{
		deviceRepo:            repository.Device{},
		deviceStatusRepo:      repository.DeviceStatus{},
		deviceDataRepo:        repository.SensorData{},
		deviceInformationRepo: repository.DeviceInformation{},
		networkRepo:           repository.Network{},
		bindingRepo:           repository.MeasurementDeviceBinding{},
	}
}

func (query DeviceQuery) GetDetail() (*vo.Device, error) {
	ctx := context.TODO()
	result := vo.NewDevice(query.Device)
	if network, err := query.networkRepo.Get(ctx, query.Device.NetworkID); err == nil {
		result.SetNetwork(network)
	}
	if t := devicetype.Get(query.Device.Type); t != nil {
		result.Properties = t.Properties(t.SensorID())
	}
	var err error
	result.State.DeviceStatus, err = query.deviceStatusRepo.Get(query.Device.ID)
	if err != nil {
		xlog.Errorf("get device [%s] status failed:%v", query.Device.MacAddress, err)
	}
	result.Information.DeviceInformation, err = query.deviceInformationRepo.Get(query.Device.ID)
	if err != nil {
		xlog.Errorf("get device information failed:%v", query.Device.MacAddress, err)
	}
	if binding, err := query.bindingRepo.GetBySpecs(ctx, spec.DeviceMacEqSpec(query.Device.MacAddress)); err == nil {
		result.SetBinding(binding)
	}
	return &result, nil
}

func (query DeviceQuery) GetSettings() (vo.DeviceSettings, error) {
	t := devicetype.Get(query.Device.Type)
	if t == nil {
		return nil, response.BusinessErr(errcode.UnknownDeviceTypeError, "")
	}
	settings := t.Settings()
	for i, setting := range t.Settings() {
		if s, ok := query.Device.Settings.Get(setting.Key); ok {
			settings[i].Value = setting.Convert(s.Value)
		} else {
			settings[i].Value = setting.Convert(setting.Value)
		}
	}
	result := vo.NewDeviceSettings(settings)
	return result, nil
}

func (query DeviceQuery) PropertyDataByRange(pid string, from, to time.Time) ([]vo.PropertyData, error) {
	if t := devicetype.Get(query.Device.Type); t != nil {
		if property, ok := t.Properties(t.SensorID()).Get(pid); ok {
			data, err := query.deviceDataRepo.Find(query.Device.MacAddress, from, to)
			if err != nil {
				return nil, err
			}
			result := make([]vo.PropertyData, len(data))
			for i, d := range data {
				result[i] = vo.PropertyData{
					Timestamp: d.Time.UTC().Unix(),
					Value:     property.Convert(d.Values),
				}
			}
			return result, nil
		}
	}
	return nil, response.BusinessErr(errcode.UnknownDeviceTypeError, "")
}

func (query DeviceQuery) DataByRange(from, to time.Time) (vo.PropertiesData, error) {
	if t := devicetype.Get(query.Device.Type); t != nil {
		data, err := query.deviceDataRepo.Find(query.Device.MacAddress, from, to)
		if err != nil {
			return nil, err
		}
		result := make(vo.PropertiesData)
		for _, property := range t.Properties(t.SensorID()) {
			result[property.Key] = make([]vo.PropertyData, len(data))
			for i, d := range data {
				result[property.Key][i] = vo.PropertyData{
					Timestamp: d.Time.UTC().Unix(),
					Value:     property.Convert(d.Values),
				}
			}
		}
		return result, nil
	}
	return nil, response.BusinessErr(errcode.UnknownDeviceTypeError, "")
}

func (query DeviceQuery) DownloadPropertiesDataByRange(pIDs []string, from time.Time, to time.Time) (*vo.ExcelFile, error) {
	if t := devicetype.Get(query.Device.Type); t != nil {
		data, err := query.DataByRange(from, to)
		if err != nil {
			return nil, err
		}
		result := vo.ExcelFile{
			Name: fmt.Sprintf("%s_%s_%s.xlsx", query.Device.MacAddress, from.Format("20060102"), to.Format("20060102")),
			File: excelize.NewFile(),
		}
		timestamp := make([]int64, 0)
		for i, pid := range pIDs {
			axis := string(rune(66 + i))
			if property, ok := t.Properties(t.SensorID()).Get(pid); ok {
				result.File.SetCellValue("Sheet1", fmt.Sprintf("%s%d", axis, 1), fmt.Sprintf("%s(%s)", property.Name, property.Unit))
				for j, d := range data[property.Key] {
					if len(timestamp) != len(data[property.Key]) {
						timestamp = append(timestamp, d.Timestamp)
					}
					result.File.SetCellValue("Sheet1", fmt.Sprintf("%s%d", axis, j+2), d.Value)
				}
			}
		}
		result.File.SetCellValue("Sheet1", "A1", "时间")
		for i, t := range timestamp {
			result.File.SetCellValue("Sheet1", fmt.Sprintf("A%d", i+2), time.Unix(t, 0).Format("2006-01-02 15:04:05"))
		}
		return &result, nil
	}
	return nil, response.BusinessErr(errcode.UnknownDeviceTypeError, "")
}
