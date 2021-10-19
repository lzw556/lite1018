package service

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/property"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
)

type Property struct {
	repository dependency.PropertyRepository
}

func NewProperty() property.Service {
	return Property{
		repository: repository.Property{},
	}
}

func (s Property) FindProperties(deviceType uint) ([]vo.Property, error) {
	es, err := s.repository.FindByDeviceTypeID(context.TODO(), deviceType)
	if err != nil {
		return nil, err
	}
	result := make([]vo.Property, len(es))
	for i, e := range es {
		result[i] = vo.NewProperty(e)
	}
	return result, nil
}
