package command

import (
	"context"
	"fmt"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/request"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/command"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/dependency"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/domain/vo"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/transaction"
	"time"
)

type NetworkUpdateCmd struct {
	entity.Network
	Gateway entity.Device

	networkRepo dependency.NetworkRepository
	deviceRepo  dependency.DeviceRepository
}

func NewNetworkUpdateCmd() NetworkUpdateCmd {
	return NetworkUpdateCmd{
		networkRepo: repository.Network{},
		deviceRepo:  repository.Device{},
	}
}

func (cmd NetworkUpdateCmd) Update(req request.Network) (*vo.Network, error) {
	isAssetChanged := cmd.Network.AssetID != req.AssetID
	cmd.Network.CommunicationPeriod = req.WSN.CommunicationPeriod
	cmd.Network.CommunicationTimeOffset = req.WSN.CommunicationTimeOffset
	cmd.Network.GroupInterval = req.WSN.GroupInterval
	cmd.Network.GroupSize = req.WSN.GroupSize
	cmd.Network.Name = req.Name
	cmd.Network.AssetID = req.AssetID
	err := transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.networkRepo.Save(txCtx, &cmd.Network.Network); err != nil {
			return err
		}
		if isAssetChanged {
			updates := map[string]interface{}{
				"asset_id": cmd.Network.AssetID,
			}
			return cmd.deviceRepo.UpdatesBySpecs(txCtx, updates, spec.NetworkEqSpec(cmd.Network.ID))
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	go command.SyncWsnSettings(cmd.Network, cmd.Gateway, true, 3*time.Second)
	result := vo.NewNetwork(cmd.Network)
	return &result, nil
}

func (cmd NetworkUpdateCmd) UpdateSetting(req request.WSN) error {
	cmd.Network.CommunicationPeriod = req.CommunicationPeriod
	cmd.Network.CommunicationTimeOffset = req.CommunicationTimeOffset
	cmd.Network.GroupInterval = req.GroupInterval
	cmd.Network.GroupSize = req.GroupSize
	err := cmd.networkRepo.Save(context.TODO(), &cmd.Network.Network)
	if err != nil {
		return err
	}
	go command.SyncWsnSettings(cmd.Network, cmd.Gateway, true, 3*time.Second)
	return nil
}

func (cmd NetworkUpdateCmd) AccessDevices(parentID uint, childrenID []uint) error {
	ctx := context.TODO()
	parent, err := cmd.deviceRepo.Get(ctx, parentID)
	if err != nil {
		return response.BusinessErr(errcode.DeviceNotFoundError, "")
	}
	children, err := cmd.deviceRepo.FindBySpecs(ctx, spec.PrimaryKeyInSpec(childrenID))
	if err != nil {
		return err
	}
	cmd.Network.AccessDevices(parent, children...)
	fmt.Println(children)
	err = transaction.Execute(context.TODO(), func(txCtx context.Context) error {
		if err := cmd.networkRepo.Save(txCtx, &cmd.Network.Network); err != nil {
			return err
		}
		return cmd.deviceRepo.UpdatesBySpecs(txCtx, map[string]interface{}{"network_id": cmd.Network.ID}, spec.PrimaryKeyInSpec(childrenID))
	})
	if err != nil {
		return err
	}
	gateway, err := cmd.deviceRepo.Get(ctx, cmd.Network.GatewayID)
	if err != nil {
		return err
	}
	for _, child := range children {
		go command.AddDevice(gateway, child, parent.MacAddress)
	}
	return nil
}

func (cmd NetworkUpdateCmd) AccessNewDevice(req request.AccessDevices) error {
	ctx := context.TODO()
	device, err := cmd.deviceRepo.GetBySpecs(ctx, spec.DeviceMacEqSpec(req.MacAddress))
	if device.ID != 0 {
		return response.BusinessErr(errcode.DeviceMacExistsError, "")
	}
	parent, err := cmd.deviceRepo.Get(ctx, req.ParentID)
	if err != nil {
		return response.BusinessErr(errcode.DeviceNotFoundError, "")
	}
	device.Device = po.Device{
		Name:       req.Name,
		MacAddress: req.MacAddress,
		NetworkID:  cmd.Network.ID,
		Type:       req.DeviceType,
		Sensors:    req.Sensors,
		System:     req.System,
		IPN:        req.IPN,
		AssetID:    cmd.Network.AssetID,
	}
	return transaction.Execute(ctx, func(txCtx context.Context) error {
		if err := cmd.deviceRepo.Create(txCtx, &device.Device); err != nil {
			return err
		}
		cmd.Network.AccessDevices(parent, device)
		return cmd.networkRepo.Save(txCtx, &cmd.Network.Network)
	})
}

func (cmd NetworkUpdateCmd) RemoveDevices(req request.RemoveDevices) error {
	ctx := context.TODO()
	devices, err := cmd.deviceRepo.FindBySpecs(ctx, spec.PrimaryKeyInSpec(req.DeviceIDs))
	if err != nil {
		return err
	}
	for i, device := range devices {
		cmd.Network.RemoveDevice(device)
		devices[i].NetworkID = 0
	}
	err = transaction.Execute(ctx, func(txCtx context.Context) error {
		if err := cmd.networkRepo.Save(txCtx, &cmd.Network.Network); err != nil {
			return err
		}
		return cmd.deviceRepo.BatchSave(txCtx, devices.PersistentObject())
	})
	if err != nil {
		return err
	}
	devices, err = cmd.deviceRepo.FindBySpecs(ctx, spec.NetworkEqSpec(cmd.Network.ID))
	if err != nil {
		return err
	}
	go command.SyncNetwork(cmd.Network, devices, 3*time.Second)
	return nil
}
