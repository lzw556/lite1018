package factory

import (
	"context"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/command"
	"github.com/thetasensors/theta-cloud-lite/server/domain/aggregate/query"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/monitoringpointtype"
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

	if req.Type >= monitoringpointtype.MonitoringPointTypeUnknown {
		return nil, response.BusinessErr(errcode.MonitoringPointTypeUnknownError, "Unkown monitoringPoint type.")
	}

	e := entity.MonitoringPoint{}

	e.Name = req.Name
	e.Type = req.Type
	e.AssetID = req.AssetID
	e.ProjectID = req.ProjectID
	e.Attributes = req.Attributes

	cmd := command.NewMonitoringPointCreateCmd()
	cmd.MonitoringPoint = e
	return &cmd, nil
}

func (factory MonitoringPoint) NewMonitoringPointUpdateCmd(monitoringPointID uint, req request.UpdateMonitoringPoint) (*command.MonitoringPointUpdateCmd, error) {
	ctx := context.TODO()
	e, err := factory.monitoringPointRepo.Get(ctx, monitoringPointID)
	if err != nil {
		return nil, response.BusinessErr(errcode.MonitoringPointNotFoundError, "Invalid monitoringPoint ID")
	}

	e.Name = req.Name
	e.Type = req.Type
	e.AssetID = req.AssetID
	e.Attributes = req.Attributes

	cmd := command.NewMonitoringPointUpdateCmd()
	cmd.MonitoringPoint = e
	return &cmd, nil
}

func (factory MonitoringPoint) NewMonitoringPointRemoveCmd(monitoringPointID uint) (*command.MonitoringPointRemoveCmd, error) {
	ctx := context.TODO()
	e, err := factory.monitoringPointRepo.Get(ctx, monitoringPointID)
	if err != nil {
		return nil, response.BusinessErr(errcode.MonitoringPointNotFoundError, "Invalid monitoringPoint ID")
	}

	cmd := command.NewMonitoringPointRemoveCmd()
	cmd.MonitoringPoint = e
	return &cmd, nil
}

func (factory MonitoringPoint) NewMonitoringPointBindDeviceCmd(MonitoringPointID uint) (*command.MonitoringPointBindDeviceCmd, error) {
	ctx := context.TODO()
	e, err := factory.monitoringPointRepo.Get(ctx, MonitoringPointID)
	if err != nil {
		return nil, response.BusinessErr(errcode.MonitoringPointNotFoundError, "Invalid monitoringPoint ID")
	}

	cmd := command.NewMonitoringPointBindDeviceCmd()
	cmd.MonitoringPoint = e
	return &cmd, nil
}

func (factory MonitoringPoint) NewMonitoringPointQuery(filters request.Filters) *query.MonitoringPointQuery {
	q := query.NewMonitoringPointQuery()
	q.Specs = factory.buildSpecs(filters)

	return &q
}

func (factory MonitoringPoint) buildSpecs(filters request.Filters) []spec.Specification {
	specs := make([]spec.Specification, 0)
	for name, v := range filters {
		switch name {
		case "project_id":
			specs = append(specs, spec.ProjectEqSpec(cast.ToUint(v)))
		case "type":
			specs = append(specs, spec.TypeEqSpec(cast.ToUint(v)))
		case "name":
			specs = append(specs, spec.NameEqSpec(cast.ToString(v)))
		case "asset_id":
			specs = append(specs, spec.AssetEqSpec(cast.ToUint(v)))
		}
	}
	return specs
}
