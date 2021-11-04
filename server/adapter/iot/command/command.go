package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/background"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"time"
)

func Execute(gateway, device entity.Device, t Type) error {
	var cmd Request
	switch t {
	case RebootCmdType:
		cmd = newRebootCmd()
	case ResetCmdType:
		cmd = newResetCmd()
	case ProvisionCmdType:
		cmd = newProvisionCmd()
	default:
		return response.BusinessErr(errcode.UnknownDeviceTypeError, "")
	}
	_, err := cmd.Execute(context.TODO(), gateway.MacAddress, device.MacAddress, 3*time.Second)
	if err != nil {
		return err
	}
	return nil
}

func SyncDeviceSettings(gateway, device entity.Device) {
	xlog.Infof("starting sync device settings => [%s]", device.MacAddress)
	cmd := newUpdateDeviceSettingsCmd(device.IPN, device.System, device.Sensors)
	if _, err := cmd.Execute(context.TODO(), gateway.MacAddress, device.MacAddress, 3*time.Second); err != nil {
		xlog.Errorf("execute device [%s] command %s failed: %v", device.MacAddress, cmd.Name(), err)
	}
	xlog.Infof("sync device settings successful=> [%s]", device.MacAddress)
}

func SyncNetwork(network entity.Network, devices []entity.Device, timeout time.Duration) error {
	var gateway entity.Device
	for _, device := range devices {
		if network.GatewayID == device.ID {
			gateway = device
			break
		}
	}
	if gateway.GetConnectionState().IsOnline {
		err := SyncWsnSettings(network, gateway, false, timeout)
		if err != nil {
			return err
		}
		return SyncDeviceList(gateway, devices, timeout)
	}
	return response.BusinessErr(errcode.DeviceCommandSendFailedError, "")
}

func SyncWsnSettings(network entity.Network, gateway entity.Device, isSyncWsnOnly bool, timeout time.Duration) error {
	xlog.Infof("starting sync wsn settings => [%s]", gateway.MacAddress)
	cmd := newUpdateWsnSettingsCmd(network, isSyncWsnOnly)
	if _, err := cmd.Execute(context.TODO(), gateway.MacAddress, gateway.MacAddress, timeout); err != nil {
		xlog.Errorf("execute device [%s] command %s failed: %v", gateway.MacAddress, cmd.Name(), err)
		return err
	}
	xlog.Infof("sync wsn settings successful=> [%s]", gateway.MacAddress)
	return nil
}

func SyncDeviceList(gateway entity.Device, devices []entity.Device, timeout time.Duration) error {
	xlog.Infof("starting sync device list => [%s]", gateway.MacAddress)
	cmd := newUpdateDeviceListCmd(gateway, devices)
	if _, err := cmd.Execute(context.TODO(), gateway.MacAddress, gateway.MacAddress, timeout); err != nil {
		xlog.Errorf("execute device [%s] command %s failed: %v", gateway.MacAddress, cmd.Name(), err)
		return err
	}
	xlog.Infof("sync device list successful=> [%s]", gateway.MacAddress)
	return nil
}

func AddDevice(gateway entity.Device, device entity.Device, parent string) {
	timeout := 3 * time.Second
	cmd := newAddDeviceCmd(device.Name, device.MacAddress, parent, device.TypeID)
	if _, err := cmd.Execute(context.TODO(), gateway.MacAddress, gateway.MacAddress, timeout); err != nil {
		xlog.Errorf("execute device [%s] command %s failed: %v", gateway.MacAddress, cmd.Name(), err)
		return
	}
	return
}

func DeleteDevice(gateway entity.Device, device entity.Device) {
	timeout := 3 * time.Second
	cmd := newDeleteDeviceCmd(device.MacAddress)
	if _, err := cmd.Execute(context.TODO(), gateway.MacAddress, gateway.MacAddress, timeout); err != nil {
		xlog.Errorf("execute device [%s] command %s failed: %v", gateway.MacAddress, cmd.Name(), err)
		return
	}
	return
}

func DeviceUpgrade(gateway entity.Device, device entity.Device, firmware po.Firmware) error {
	queue := background.GetTaskQueue(gateway.MacAddress)
	if queue == nil {
		queue = background.NewTaskQueue(gateway)
		background.AddTaskQueue(gateway.MacAddress, queue)
	}
	queue.Append(background.NewTask(device, NewDeviceUpgradeExecutor(firmware)))
	if !queue.IsRunning() {
		queue.Run()
	}
	return nil
}

func CancelDeviceUpgrade(gateway entity.Device, device entity.Device) error {
	queue := background.GetTaskQueue(gateway.MacAddress)
	if queue == nil {
		return nil
	}
	switch device.GetUpgradeState().Status {
	case entity.DeviceUpgradeStatusPending:
		queue.Remove(device)
		device.CancelUpgrade()
	case entity.DeviceUpgradeStatusLoading, entity.DeviceUpgradeStatusUpgrading:
		cmd := newCancelFirmwareCmd()
		ctx := context.TODO()
		_, err := cmd.Execute(ctx, gateway.MacAddress, device.MacAddress, 3*time.Second)
		if err != nil {
			return err
		}
		task := queue.GetTask(device)
		if task != nil {
			task.Cancel()
		}
		device.CancelUpgrade()
	}
	return nil
}
