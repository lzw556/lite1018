package query

import (
	"context"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/calculate"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"time"
)

type DeviceQuery struct {
	entity.Device

	deviceRepo            dependency.DeviceRepository
	deviceStatusRepo      dependency.DeviceStatusRepository
	deviceDataRepo        dependency.SensorDataRepository
	deviceInformationRepo dependency.DeviceInformationRepository
	networkRepo           dependency.NetworkRepository
	propertyRepo          dependency.PropertyRepository
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
		propertyRepo:          repository.Property{},
		bindingRepo:           repository.MeasurementDeviceBinding{},
	}
}

func (query DeviceQuery) Detail() (*vo.Device, error) {
	ctx := context.TODO()
	result := vo.NewDevice(query.Device)
	fmt.Println(query.Device)
	if network, err := query.networkRepo.Get(ctx, query.Device.NetworkID); err == nil {
		result.SetNetwork(network)
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
	if properties, err := query.propertyRepo.FindByDeviceTypeID(ctx, query.Device.Type); err == nil {
		result.SetProperties(properties)
	}
	if binding, err := query.bindingRepo.GetBySpecs(ctx, spec.DeviceMacEqSpec(query.Device.MacAddress)); err == nil {
		result.SetBinding(binding)
	}
	return &result, nil
}

func (query DeviceQuery) Setting() *vo.DeviceSetting {
	result := vo.NewDeviceSetting(query.Device)
	return &result
}

func (query DeviceQuery) PropertyDataByRange(pid uint, from, to time.Time) (vo.PropertyData, error) {
	property, err := query.propertyRepo.Get(context.TODO(), pid)
	if err != nil {
		return vo.PropertyData{}, err
	}
	data, err := query.deviceDataRepo.Find(query.Device.MacAddress, from, to)
	if err != nil {
		return vo.PropertyData{}, err
	}
	return query.getPropertyData(property, data), nil
}

func (query DeviceQuery) getPropertyData(property po.Property, data []entity.SensorData) vo.PropertyData {
	result := vo.NewPropertyData(property)
	for k := range property.Fields {
		result.Fields[k] = make([]float32, len(data))
	}
	result.Time = make([]int64, len(data))
	for i, d := range data {
		result.Time[i] = d.Time.UTC().Unix()
		for k, v := range property.Fields {
			switch k {
			case "corrosion_rate":
				result.Fields[k][i] = query.calculateCorrosionRate(d, v, d.Time)
			default:
				result.Fields[k][i] = d.Values[v]
			}
		}
	}
	return result
}

func (query DeviceQuery) calculateCorrosionRate(current entity.SensorData, idx uint, t time.Time) float32 {
	monthAgo, err := query.deviceDataRepo.Get(query.Device.MacAddress, t.AddDate(0, -1, 0))
	if err != nil {
		return 0
	}
	if current.Time == monthAgo.Time {
		return 0
	}
	return calculate.CorrosionRate(monthAgo.Values[idx], current.Values[idx], current.Time.Sub(monthAgo.Time).Seconds())
}

func (query DeviceQuery) DataByRange(from, to time.Time) ([]vo.PropertyData, error) {
	ctx := context.TODO()
	properties, err := query.propertyRepo.FindByDeviceTypeID(ctx, query.Device.Type)
	if err != nil {
		return nil, err
	}
	data, err := query.deviceDataRepo.Find(query.Device.MacAddress, from, to)
	if err != nil {
		return nil, err
	}
	result := make([]vo.PropertyData, len(properties))
	for i, property := range properties {
		result[i] = query.getPropertyData(property, data)
	}
	return result, nil
}
