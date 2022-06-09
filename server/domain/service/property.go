package service

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/property"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/monitoringpointtype"
)

type Property struct {
}

func NewProperty() property.Service {
	return Property{}
}

func (s Property) FindPropertiesByDeviceType(deviceType uint) (vo.Properties, error) {
	if t := devicetype.Get(deviceType); t != nil {
		properties := make(vo.Properties, len(t.Properties(t.SensorID())))
		for i, p := range t.Properties(t.SensorID()) {
			properties[i] = vo.NewProperty(p)
		}
		return properties, nil
	}
	return nil, response.BusinessErr(errcode.UnknownDeviceTypeError, "")
}

func (s Property) FindMonitoringPointProperties(monitoringPointType uint) (vo.MPProperties, error) {
	if t := monitoringpointtype.Get(monitoringPointType); t != nil {
		properties := make(vo.MPProperties, len(t.Properties()))
		for i, p := range t.Properties() {
			properties[i] = vo.NewMonitoringPointProperty(p)
		}
		return properties, nil
	}
	return nil, response.BusinessErr(errcode.MonitoringPointTypeUnknownError, "")
}
