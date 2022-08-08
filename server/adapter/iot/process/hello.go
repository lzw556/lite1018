package process

import (
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
)

type Hello struct {
	networkRepo dependency.NetworkRepository
}

func NewHello() Processor {
	return newRoot(&Hello{
		networkRepo: repository.Network{},
	})
}

func (p Hello) Name() string {
	return "Hello"
}

func (p Hello) Next() Processor {
	return nil
}

func (p Hello) Process(ctx *iot.Context, msg iot.Message) error {
	return nil
}
