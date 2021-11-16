package command

import (
	"context"
	"github.com/golang/protobuf/proto"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/api/response"
	"github.com/thetasensors/theta-cloud-lite/server/adapter/iot/background"
	pd "github.com/thetasensors/theta-cloud-lite/server/adapter/iot/proto"
	"github.com/thetasensors/theta-cloud-lite/server/domain/entity"
	"github.com/thetasensors/theta-cloud-lite/server/domain/po"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/errcode"
	"github.com/thetasensors/theta-cloud-lite/server/pkg/json"
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
	case ResetDataCmdType:
		cmd = newResetDataCmd()
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
	return nil
}

func SyncNetworkLinkStatus(network entity.Network, devices []entity.Device, timeout time.Duration) {
	var gateway entity.Device
	for _, device := range devices {
		if network.GatewayID == device.ID {
			gateway = device
			break
		}
	}
	xlog.Infof("starting sync devices link status => [%s]", gateway.MacAddress)
	if gateway.GetConnectionState().IsOnline {
		cmd := newGetAllLinkStatusCmd()
		payload, err := cmd.Execute(context.TODO(), gateway.MacAddress, gateway.MacAddress, 3*time.Second)
		if err != nil {
			xlog.Errorf("sync devices link status failed:%v", err)
			return
		}
		m := pd.AllLinkStatusMessage{}
		if err := proto.Unmarshal(payload, &m); err != nil {
			xlog.Errorf("unmarshal [AllLinkStatus] message failed:%v", err)
			return
		}
		var result []struct {
			Mac   string `json:"mac"`
			State int    `json:"state"`
		}
		if err := json.Unmarshal([]byte(m.AllStatus), &result); err != nil {
			xlog.Errorf("unmarshal [DeviceStatus] failed:%v", err)
			return
		}
		statusMap := make(map[string]bool)
		for _, r := range result {
			statusMap[r.Mac] = r.State == 3
		}
		for _, device := range devices {
			if isOnline, ok := statusMap[device.MacAddress]; ok {
				device.UpdateConnectionState(isOnline)
			}
		}
		xlog.Infof("sync devices link status successful=> [%s]", gateway.MacAddress)
	}
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
