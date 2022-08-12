package command

import (
	"context"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/background"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"time"
)

var networkRepo = repository.Network{}

func Execute(gateway, device entity.Device, t Type) error {
	var cmd Request
	switch t {
	case RebootCmdType:
		cmd = newRebootCmd()
	case ResetCmdType:
		cmd = newResetCmd()
	case ResetDataCmdType:
		cmd = newResetDataCmd()
	case ProvisionCmdType:
		cmd = newProvisionCmd()
	case AcquireSensorDataType:
		cmd = newAcquireSensorDataCmd()
	default:
		return response.BusinessErr(errcode.UnknownDeviceTypeError, "")
	}
	if gateway.IsOnline() {
		xlog.Infof("execute command %s => [%s]", cmd.Name(), device.MacAddress)
		err := cmd.ExecuteAsync(gateway.MacAddress, device.MacAddress, false)
		if err != nil {
			xlog.Errorf("execute device [%s] command %s failed: %v", device.MacAddress, cmd.Name(), err)
			return err
		}
		xlog.Infof("execute command %s successful => [%s]", cmd.Name(), device.MacAddress)
		return nil
	} else {
		xlog.Errorf("execute command %s failed: gateway offline => [%s]", cmd.Name(), gateway.MacAddress)
	}
	return response.BusinessErr(errcode.DeviceOfflineError, "")
}

func SyncNetwork(network entity.Network, devices []entity.Device, timeout time.Duration) error {
	var gateway entity.Device
	for _, device := range devices {
		if network.GatewayID == device.ID {
			gateway = device
			break
		}
	}
	if gateway.IsOnline() {
		if err := UpdateWsnSettings(network, gateway); err != nil {
			xlog.Errorf("update wsn settings failed: %v", err)
			return err
		}
		if err := SyncDeviceList(gateway, devices); err != nil {
			return err
		}
		SyncDeviceSettings(gateway, devices...)
		if err := networkRepo.Save(context.TODO(), &network); err != nil {
			return err
		}
		return nil
	}
	return response.BusinessErr(errcode.DeviceOfflineError, "")
}

func SyncDeviceSettings(gateway entity.Device, devices ...entity.Device) {
	for i := range devices {
		device := devices[i]
		go UpdateDeviceSettings(gateway, device)
	}
}

func UpdateDeviceSettings(gateway, device entity.Device) {
	xlog.Infof("starting update device settings => [%s]", device.MacAddress)
	cmd := newUpdateDeviceSettingsCmd(device.Settings)
	if _, err := cmd.Execute(gateway.MacAddress, device.MacAddress, false); err != nil {
		xlog.Errorf("execute command %s failed: %v => [%s]", cmd.Name(), err, gateway.MacAddress)
		return
	}
	xlog.Infof("update device settings successful=> [%s]", device.MacAddress)
}

func UpdateWsnSettings(network entity.Network, gateway entity.Device) error {
	if gateway.IsOnline() {
		xlog.Infof("starting update wsn settings => [%s]", gateway.MacAddress)
		cmd := newUpdateWsnSettingsCmd(network)
		if _, err := cmd.Execute(gateway.MacAddress, gateway.MacAddress, false); err != nil {
			xlog.Errorf("execute device command %s failed: %v => [%s]", cmd.Name(), err, gateway.MacAddress)
			return err
		}
		xlog.Infof("sync wsn settings successful=> [%s]", gateway.MacAddress)
	} else {
		xlog.Errorf("update wsn settings failed: device offline => [%s]", gateway.MacAddress)
		return response.BusinessErr(errcode.DeviceOfflineError, "")
	}
	return nil
}

func SyncDeviceList(gateway entity.Device, devices []entity.Device) error {
	if err := ClearDevices(gateway); err != nil {
		return err
	}

	go func() {
		macs := make([]string, 0)
		for i := range devices {
			device := devices[i]
			if gateway.MacAddress != device.MacAddress {
				macs = append(macs, device.MacAddress)
			}
		}
		cache.BatchDeleteConnections(macs...)
	}()

	xlog.Infof("starting sync device list => [%s]", gateway.MacAddress)
	if gateway.IsOnline() {
		cmd := newUpdateDevicesCmd(gateway, devices)
		if _, err := cmd.Execute(gateway.MacAddress, gateway.MacAddress, false); err != nil {
			xlog.Errorf("execute device command %s failed: %v => [%s]", cmd.Name(), err, gateway.MacAddress)
			return err
		}
		xlog.Infof("sync device list successful=> [%s]", gateway.MacAddress)
	} else {
		xlog.Errorf("sync device list failed: gateway offline => [%s]", gateway.MacAddress)
	}
	return nil
}

func AddDevice(gateway entity.Device, device entity.Device) {
	cmd := newAddDeviceCmd(device)
	if _, err := cmd.Execute(gateway.MacAddress, gateway.MacAddress, false); err != nil {
		xlog.Errorf("execute device command %s failed: %v => [%s]", cmd.Name(), err, gateway.MacAddress)
		return
	}
	UpdateDeviceSettings(gateway, device)
	return
}

func UpdateDevice(gateway entity.Device, device entity.Device, oldMac string) {
	cmd := newUpdateDeviceCmd(device.Name, oldMac, device.MacAddress, device.Parent, int32(device.Type))
	if _, err := cmd.Execute(gateway.MacAddress, gateway.MacAddress, false); err != nil {
		xlog.Errorf("execute device command %s failed: %v => [%s]", cmd.Name(), err, gateway.MacAddress)
		return
	}
	return
}

func ClearDevices(gateway entity.Device) error {
	cmd := newClearDevicesCmd()
	if _, err := cmd.Execute(gateway.MacAddress, gateway.MacAddress, false); err != nil {
		xlog.Errorf("execute device command %s failed: %v => [%s]", cmd.Name(), err, gateway.MacAddress)
		return err
	}
	return nil
}

func DeleteDevice(gateway entity.Device, device entity.Device) {
	cmd := newDeleteDeviceCmd(device.MacAddress)
	if _, err := cmd.Execute(gateway.MacAddress, gateway.MacAddress, false); err != nil {
		xlog.Errorf("execute device command %s failed: %v => [%s]", cmd.Name(), err, gateway.MacAddress)
		return
	}
	return
}

func DeviceUpgrade(gateway entity.Device, device entity.Device, firmware entity.Firmware) error {
	queue := background.GetTaskQueue(gateway.MacAddress)
	if queue == nil {
		queue = background.NewTaskQueue(gateway)
		background.AddTaskQueue(gateway.MacAddress, queue)
	}
	queue.Append(background.NewTask(device, NewDeviceUpgradeExecutor(firmware)))
	if !queue.IsRunning() {
		go queue.Run()
	}
	return nil
}

func CancelDeviceUpgrade(gateway entity.Device, device entity.Device) error {
	queue := background.GetTaskQueue(gateway.MacAddress)
	if queue == nil {
		return nil
	}
	status := device.GetUpgradeStatus()
	xlog.Infof("device upgrade code: %d => [%s]", status.Code, device.MacAddress)
	switch status.Code {
	case entity.DeviceUpgradeLoading, entity.DeviceUpgradeUpgrading:
		cmd := newCancelFirmwareCmd()
		_, err := cmd.Execute(gateway.MacAddress, device.MacAddress, false)
		if err != nil {
			xlog.Errorf("execute device command %s failed: %v => [%s]", cmd.Name(), err, gateway.MacAddress)
		}
		task := queue.GetTask(device)
		if task != nil {
			task.Cancel()
		}
	}
	device.CancelUpgrade()
	queue.Remove(device)
	return nil
}

func Calibrate(gateway entity.Device, device entity.Device, param float32) error {
	if gateway.IsOnline() {
		if t := devicetype.Get(device.Type); t != nil {
			cmd := newCalibrateCmd(t.SensorID(), param)
			if _, err := cmd.Execute(gateway.MacAddress, device.MacAddress, false); err != nil {
				xlog.Errorf("execute device command %s failed: %v => [%s]", cmd.Name(), err, gateway.MacAddress)
				return err
			}
			return nil
		} else {
			return response.BusinessErr(errcode.UnknownDeviceTypeError, "")
		}
	} else {
		xlog.Errorf("calibrate failed: gateway offline => [%s]", gateway.MacAddress)
		return response.BusinessErr(errcode.DeviceOfflineError, "")
	}
}

func AcquireSensorData(gateway entity.Device, device entity.Device) error {
	if gateway.IsOnline() {
		cmd := newAcquireSensorDataCmd()
		if err := cmd.ExecuteAsync(gateway.MacAddress, device.MacAddress, false); err != nil {
			xlog.Errorf("execute device command %s failed: %v => [%s]", cmd.Name(), err, gateway.MacAddress)
			return err
		}
		return nil
	} else {
		xlog.Errorf("calibrate failed: gateway offline => [%s]", gateway.MacAddress)
		return response.BusinessErr(errcode.DeviceOfflineError, "")
	}
}
