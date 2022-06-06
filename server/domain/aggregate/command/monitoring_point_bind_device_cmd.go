package command

import (
	"context"

	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
)

type MonitoringPointBindDeviceCmd struct {
	entity.MonitoringPoint

	monitoringPointDeviceBindingRepo dependency.MonitoringPointDeviceBindingRepository
}

func NewMonitoringPointBindDeviceCmd() MonitoringPointBindDeviceCmd {
	return MonitoringPointBindDeviceCmd{
		monitoringPointDeviceBindingRepo: repository.MonitoringPointDeviceBinding{},
	}
}

func (cmd MonitoringPointBindDeviceCmd) BindDevice(req request.BindDevice) error {
	ctx := context.TODO()
	binding := entity.MonitoringPointDeviceBinding{
		MonitoringPointID: cmd.MonitoringPoint.ID,
		DeviceID:          req.DeviceID,
		ProcessID:         req.ProcessID,
		Parameters:        req.Parameters,
	}
	if err := cmd.monitoringPointDeviceBindingRepo.Create(ctx, &binding); err != nil {
		return err
	}

	return nil
}

func (cmd MonitoringPointBindDeviceCmd) UnbindDevice(req request.UnbindDevice) error {
	if err := cmd.monitoringPointDeviceBindingRepo.DeleteBySpecs(context.TODO(), spec.DeviceIDEqSpec(req.DeviceID)); err != nil {
		return err
	}

	return nil
}
