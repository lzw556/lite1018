package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
	"time"
)

type DeviceRemoveCmd struct {
	entity.Device
	Network entity.Network

	deviceDataRepo        dependency.SensorDataRepository
	deviceRepo            dependency.DeviceRepository
	deviceStatusRepo      dependency.DeviceStateRepository
	deviceInformationRepo dependency.DeviceInformationRepository
	networkRepo           dependency.NetworkRepository
	eventRepo             dependency.EventRepository
}

func NewDeviceRemoveCmd() DeviceRemoveCmd {
	return DeviceRemoveCmd{
		deviceRepo:            repository.Device{},
		deviceDataRepo:        repository.SensorData{},
		deviceStatusRepo:      repository.DeviceState{},
		deviceInformationRepo: repository.DeviceInformation{},
		networkRepo:           repository.Network{},
		eventRepo:             repository.Event{},
	}
}

func (cmd DeviceRemoveCmd) Run() error {
	err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.deviceRepo.Delete(txCtx, cmd.Device.ID); err != nil {
			return err
		}
		_ = cmd.deviceInformationRepo.Delete(cmd.Device.ID)
		_ = cmd.deviceStatusRepo.Delete(cmd.Device.MacAddress)
		if cmd.Device.NetworkID > 0 {
			cmd.Network.RemoveDevice(cmd.Device)
			return cmd.networkRepo.Save(txCtx, &cmd.Network)
		}
		return nil
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

func (cmd DeviceRemoveCmd) RemoveData(sensorType uint, from, to time.Time) error {
	return cmd.deviceDataRepo.Delete(cmd.Device.MacAddress, sensorType, from, to)
}

func (cmd DeviceRemoveCmd) RemoveEvents(ids []uint) error {
	return cmd.eventRepo.DeleteBySpecs(context.TODO(), spec.SourceEqSpec(cmd.Device.ID), spec.PrimaryKeyInSpec(ids))
}
