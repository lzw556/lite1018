package service

import "github.com/thetasensors/theta-cloud-lite/server/adapter/api/router/measurement"

type Measurement struct {
}

func NewMeasurement() measurement.Service {
	return Measurement{}
}
