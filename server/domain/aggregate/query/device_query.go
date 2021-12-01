package query

import (
	"context"
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
	Network entity.Network

	deviceRepo            dependency.DeviceRepository
	deviceStatusRepo      dependency.DeviceStatusRepository
	deviceDataRepo        dependency.DeviceDataRepository
	deviceInformationRepo dependency.DeviceInformationRepository
	assetRepo             dependency.AssetRepository
	propertyRepo          dependency.PropertyRepository
	alarmRuleRepo         dependency.AlarmRuleRepository
}

func NewDeviceQuery() DeviceQuery {
	return DeviceQuery{
		deviceRepo:            repository.Device{},
		deviceStatusRepo:      repository.DeviceStatus{},
		deviceDataRepo:        repository.DeviceData{},
		deviceInformationRepo: repository.DeviceInformation{},
		assetRepo:             repository.Asset{},
		propertyRepo:          repository.Property{},
		alarmRuleRepo:         repository.AlarmRule{},
	}
}

func (query DeviceQuery) Detail() (*vo.Device, error) {
	ctx := context.TODO()
	asset, err := query.assetRepo.Get(ctx, query.Device.AssetID)
	if err != nil {
		return nil, err
	}
	result := vo.NewDevice(query.Device)
	result.SetAsset(asset)
	result.State.DeviceStatus, err = query.deviceStatusRepo.Get(query.Device.ID)
	if err != nil {
		xlog.Errorf("get device [%s] status failed:%v", query.Device.MacAddress, err)
	}
	result.Information.DeviceInformation, err = query.deviceInformationRepo.Get(query.Device.ID)
	if err != nil {
		xlog.Errorf("get device information failed:%v", query.Device.MacAddress, err)
	}
	if query.Network.ID != 0 {
		result.SetWSN(query.Network)
	}
	if properties, err := query.propertyRepo.FindByDeviceTypeID(ctx, query.Device.TypeID); err == nil {
		result.SetProperties(properties)
	}
	return &result, nil
}

func (query DeviceQuery) Setting() *vo.DeviceSetting {
	result := vo.NewDeviceSetting(query.Device)
	if query.Network.ID != 0 {
		result.SetNetwork(query.Network)
	}
	return &result
}

func (query DeviceQuery) PropertyDataByRange(pid uint, from, to time.Time) (vo.PropertyData, error) {
	property, err := query.propertyRepo.Get(context.TODO(), pid)
	if err != nil {
		return vo.PropertyData{}, err
	}
	data, err := query.deviceDataRepo.Find(query.Device.ID, from, to)
	if err != nil {
		return vo.PropertyData{}, err
	}
	return query.getPropertyData(property, data), nil
}

func (query DeviceQuery) getPropertyData(property po.Property, data []po.DeviceData) vo.PropertyData {
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

func (query DeviceQuery) calculateCorrosionRate(current po.DeviceData, idx uint, t time.Time) float32 {
	monthAgo, err := query.deviceDataRepo.Get(query.Device.ID, t.AddDate(0, -1, 0))
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
	properties, err := query.propertyRepo.FindByDeviceTypeID(ctx, query.Device.TypeID)
	if err != nil {
		return nil, err
	}
	data, err := query.deviceDataRepo.Find(query.Device.ID, from, to)
	if err != nil {
		return nil, err
	}
	result := make([]vo.PropertyData, len(properties))
	for i, property := range properties {
		result[i] = query.getPropertyData(property, data)
		alarmRules, err := query.alarmRuleRepo.FindBySpecs(ctx, spec.PropertyEqSpec(property.ID))
		if err != nil {
			return nil, err
		}
		result[i].AddAlarms(alarmRules...)
	}
	return result, nil
}
