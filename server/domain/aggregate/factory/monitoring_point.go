package factory

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/command"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
)

type MonitoringPoint struct {
	monitoringPointRepo dependency.MonitoringPointRepository
}

func NewMonitoringPoint() MonitoringPoint {
	return MonitoringPoint{
		monitoringPointRepo: repository.MonitoringPoint{},
	}
}

func (factory MonitoringPoint) NewMonitoringPointCreateCmd(req request.CreateMonitoringPoint) (*command.MonitoringPointCreateCmd, error) {
	_ = context.TODO()

	if req.Type >= entity.MonitoringPointTypeUnknown {
		return nil, response.BusinessErr(errcode.MonitoringPointTypeUnknownError, "Unkown monitoringPoint type.")
	}

	e := entity.MonitoringPoint{}

	e.Name = req.Name
	e.Type = req.Type
	e.AssetID = req.AssetID
	e.ProjectID = req.ProjectID

	cmd := command.NewMonitoringPointCreateCmd()
	cmd.MonitoringPoint = e
	return &cmd, nil
}
