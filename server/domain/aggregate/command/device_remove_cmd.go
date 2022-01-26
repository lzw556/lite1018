package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
	"time"
)

type DeviceRemoveCmd struct {
	entity.Device
	Network entity.Network

	deviceDataRepo        dependency.SensorDataRepository
	deviceRepo            dependency.DeviceRepository
	deviceStatusRepo      dependency.DeviceStatusRepository
	deviceInformationRepo dependency.DeviceInformationRepository
	networkRepo           dependency.NetworkRepository
	bindingRepo           dependency.MeasurementDeviceBindingRepository
}

func NewDeviceRemoveCmd() DeviceRemoveCmd {
	return DeviceRemoveCmd{
		deviceRepo:            repository.Device{},
		deviceDataRepo:        repository.SensorData{},
		deviceStatusRepo:      repository.DeviceStatus{},
		deviceInformationRepo: repository.DeviceInformation{},
		networkRepo:           repository.Network{},
		bindingRepo:           repository.MeasurementDeviceBinding{},
	}
}

func (cmd DeviceRemoveCmd) Run() error {
	err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.deviceRepo.Delete(txCtx, cmd.Device.ID); err != nil {
			return err
		}
		switch cmd.Device.Type {
		case devicetype.GatewayType, devicetype.RouterType:
		default:
			if err := cmd.deviceInformationRepo.Delete(cmd.Device.ID); err != nil {
				return err
			}
			if err := cmd.deviceStatusRepo.Delete(cmd.Device.MacAddress); err != nil {
				return err
			}
		}
		if cmd.Device.NetworkID > 0 {
			cmd.Network.RemoveDevice(cmd.Device)
			return cmd.networkRepo.Save(txCtx, &cmd.Network.Network)
		}
		return cmd.bindingRepo.DeleteBySpecs(txCtx, spec.DeviceMacEqSpec(cmd.Device.MacAddress))
	})
	if err != nil {
		return err
	}
	if cmd.Device.NetworkID > 0 {
		devices, err := cmd.deviceRepo.FindBySpecs(context.TODO(), spec.NetworkEqSpec(cmd.Network.ID))
		if err != nil {
			return err
		}
		return command.SyncNetwork(cmd.Network, devices, 3*time.Second)
	}
	return nil
}

func (cmd DeviceRemoveCmd) RemoveData(from, to time.Time) error {
	return cmd.deviceDataRepo.Delete(cmd.Device.MacAddress, from, to)
}
