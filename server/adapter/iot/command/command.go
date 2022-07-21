package command

import (
	"context"
	"fmt"
	"github.com/spf13/cast"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/background"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/repository"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	spec "github.com/thetasensors/theta-cloud-lite/server/domain/specification"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/cache"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/devicetype"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/eventbus"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/xlog"
	"github.com/thetasensors/theta-cloud-lite/server/worker"
	"time"
)

var deviceRepo = repository.Device{}
var networkRepo = repository.Network{}

func isOnline(mac string) bool {
	state, _, _ := cache.GetConnection(mac)
	return state
}

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
	default:
		return response.BusinessErr(errcode.UnknownDeviceTypeError, "")
	}
	if isOnline(gateway.MacAddress) {
		xlog.Infof("execute command %s => [%s]", cmd.Name(), device.MacAddress)
		_, err := cmd.Execute(gateway.MacAddress, device.MacAddress)
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

func SyncNetworkLinkStates(network entity.Network) {
	devices, err := deviceRepo.FindBySpecs(context.TODO(), spec.NetworkEqSpec(network.ID))
	if err != nil {
		xlog.Errorf("sync network link states failed: %v", err)
		return
	}
	var gateway entity.Device
	for _, device := range devices {
		if network.GatewayID == device.ID {
			gateway = device
			break
		}
	}
	xlog.Infof("starting sync devices link status => [%s]", gateway.MacAddress)
	cmd := newGetLinkStatesCmd()
	resp, err := cmd.Execute(gateway.MacAddress, gateway.MacAddress)
	if err != nil {
		xlog.Errorf("execute command %s failed: %v => [%s]", cmd.Name(), err, gateway.MacAddress)
		return
	}
	var result []struct {
		Mac   string `json:"mac"`
		State int    `json:"state"`
	}
	if err := json.Unmarshal(resp.Payload, &result); err != nil {
		xlog.Errorf("unmarshal [AllStatus] failed:%v", err)
		return
	}
	statusMap := make(map[string]bool)
	for i := range result {
		r := result[i]
		if r.Mac != gateway.MacAddress {
			if r.State > 1 {
				statusMap[r.Mac] = true
			} else {
				statusMap[r.Mac] = false
			}
		}
	}
	for i := range devices {
		device := devices[i]
		if device.MacAddress != gateway.MacAddress {
			oldState, _, _ := cache.GetConnection(device.MacAddress)
			newState, _ := statusMap[device.MacAddress]
			if newState != oldState {
				eventbus.Publish(eventbus.SocketEmit, "socket::deviceStateChangedEvent", map[string]interface{}{
					"macAddress": device.MacAddress,
					"state": map[string]interface{}{
						"isOnline":    newState,
						"connectedAt": time.Now().Unix(),
					},
				})
				go func(isOnline bool) {
					event := entity.Event{
						Code:      entity.EventCodeStatus,
						Category:  entity.EventCategoryDevice,
						SourceID:  device.ID,
						Timestamp: time.Now().Unix(),
						ProjectID: device.ProjectID,
					}
					code := 0
					if !isOnline {
						code = 2
					}
					event.Content = fmt.Sprintf(`{"code": %d}`, code)
					worker.EventsChan <- event
				}(newState)
				if newState {
					cache.SetOnline(device.MacAddress)
				} else {
					cache.SetOffline(device.MacAddress)
				}
			}
		}
	}
	xlog.Infof("sync devices link status successful=> [%s]", gateway.MacAddress)
}

func SyncNetwork(network entity.Network, devices []entity.Device, timeout time.Duration) error {
	var gateway entity.Device
	for _, device := range devices {
		if network.GatewayID == device.ID {
			gateway = device
			break
		}
	}
	if isOnline(gateway.MacAddress) {
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
	if _, err := cmd.Execute(gateway.MacAddress, device.MacAddress); err != nil {
		xlog.Errorf("execute command %s failed: %v => [%s]", cmd.Name(), err, gateway.MacAddress)
		return
	}
	xlog.Infof("update device settings successful=> [%s]", device.MacAddress)
}

func GetDeviceSettings(gateway, device entity.Device) {
	xlog.Infof("starting get device settings => [%s]", device.MacAddress)
	cmd := newGetDeviceSettingsCmd()
	resp, err := cmd.Execute(gateway.MacAddress, device.MacAddress)
	if err != nil {
		xlog.Errorf("execute command %s failed: %v => [%s]", cmd.Name(), err, gateway.MacAddress)
		return
	}
	if resp.Code == 0 {
		settings := map[string]map[string]interface{}{}
		if err := json.Unmarshal(resp.Payload, &settings); err != nil {
			xlog.Errorf("unmarshal device settings failed: %v => [%s]", err, gateway.MacAddress)
			return
		}
		for i := range device.Settings {
			if setting, ok := settings[device.Settings[i].Category]; ok {
				device.Settings[i].Value = setting[device.Settings[i].Key]
			}
		}
		if err := deviceRepo.Save(context.TODO(), &device); err != nil {
			return
		}
		xlog.Infof("get device settings successful=> [%s]", device.MacAddress)
		return
	}
	xlog.Errorf("get device settings failed: %d => [%s]", resp.Code, gateway.MacAddress)
}

func GetWsnSettings(network entity.Network, gateway entity.Device) {
	xlog.Infof("starting get wsn settings => [%s]", gateway.MacAddress)
	cmd := newGetWsnCmd()
	resp, err := cmd.Execute(gateway.MacAddress, gateway.MacAddress)
	if err != nil {
		xlog.Errorf("execute command %s failed: %v => [%s]", cmd.Name(), err, gateway.MacAddress)
		return
	}
	if resp.Code == 0 {
		settings := map[string]map[string]interface{}{}
		if err := json.Unmarshal(resp.Payload, &settings); err != nil {
			xlog.Errorf("unmarshal wsn settings failed: %v => [%s]", err, gateway.MacAddress)
			return
		}

		// sync network settings to database
		if wsn, ok := settings["wsn"]; ok {
			network.CommunicationPeriod = cast.ToUint(wsn["communication_period"])
			network.CommunicationTimeOffset = cast.ToUint(wsn["communication_time_offset"])
			network.GroupSize = cast.ToUint(wsn["group_size"])
			network.GroupInterval = cast.ToUint(wsn["group_interval"])
			if err := networkRepo.Save(context.TODO(), &network); err != nil {
				xlog.Errorf("update network settings failed: %v => [%s]", err, gateway.MacAddress)
				return
			}
		}
		xlog.Infof("get wsn settings successful=> [%s]", gateway.MacAddress)
	} else {
		xlog.Errorf("get wsn settings failed: %d => [%s]", resp.Code, gateway.MacAddress)
	}
}

func UpdateWsnSettings(network entity.Network, gateway entity.Device) error {
	if isOnline(gateway.MacAddress) {
		xlog.Infof("starting update wsn settings => [%s]", gateway.MacAddress)
		cmd := newUpdateWsnSettingsCmd(network)
		if _, err := cmd.Execute(gateway.MacAddress, gateway.MacAddress); err != nil {
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
	if isOnline(gateway.MacAddress) {
		cmd := newUpdateDevicesCmd(gateway, devices)
		if _, err := cmd.Execute(gateway.MacAddress, gateway.MacAddress); err != nil {
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
	if _, err := cmd.Execute(gateway.MacAddress, gateway.MacAddress); err != nil {
		xlog.Errorf("execute device command %s failed: %v => [%s]", cmd.Name(), err, gateway.MacAddress)
		return
	}
	UpdateDeviceSettings(gateway, device)
	return
}

func UpdateDevice(gateway entity.Device, device entity.Device, oldMac string) {
	cmd := newUpdateDeviceCmd(device.Name, oldMac, device.MacAddress, device.Parent, int32(device.Type))
	if _, err := cmd.Execute(gateway.MacAddress, gateway.MacAddress); err != nil {
		xlog.Errorf("execute device command %s failed: %v => [%s]", cmd.Name(), err, gateway.MacAddress)
		return
	}
	return
}

func ClearDevices(gateway entity.Device) error {
	cmd := newClearDevicesCmd()
	if _, err := cmd.Execute(gateway.MacAddress, gateway.MacAddress); err != nil {
		xlog.Errorf("execute device command %s failed: %v => [%s]", cmd.Name(), err, gateway.MacAddress)
		return err
	}
	return nil
}

func DeleteDevice(gateway entity.Device, device entity.Device) {
	cmd := newDeleteDeviceCmd(device.MacAddress)
	if _, err := cmd.Execute(gateway.MacAddress, gateway.MacAddress); err != nil {
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
		_, err := cmd.Execute(gateway.MacAddress, device.MacAddress)
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
	if isOnline(gateway.MacAddress) {
		if t := devicetype.Get(device.Type); t != nil {
			cmd := newCalibrateCmd(t.SensorID(), param)
			if _, err := cmd.Execute(gateway.MacAddress, device.MacAddress); err != nil {
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
